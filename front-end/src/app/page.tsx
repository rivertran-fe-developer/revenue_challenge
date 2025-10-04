"use client";
import { ChartBarStacked } from "./charts/BarChartStacked";
import { Button } from "@/components/ui/button";
import { ChartColumn, Download } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import axios from "axios";
import api from "@/lib/axios";

// Define types
export type RevenueDayType = {
  date: string;
  day: string;
  posRevenue: number;
  eatclubRevenue: number;
  labourCosts: number;
  totalCovers: number;
  positiveEventImpact: number;
  negativeEventImpact: number;
};

export type RevenueType = {
  title: string;
  periodType: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  averagePerDay: number;
  totalCovers: number;
  isProcessed: boolean;
  dataSource: string;
  days: RevenueDayType[];
  createdAt: string;
  updatedAt: string;
};

export type ChartDataType = {
  day: string;
  current: number;
  previous: number;
  posCurrent: number;
  eatclubCurrent: number;
  labourCurrent: number;
  posPrevious?: number;
  eatclubPrevious?: number;
  labourPrevious?: number;
  positiveEventImpact?: number;
  negativeEventImpact?: number;
};

export type ComparisonMetricsType = {
  revenue: {
    current: number;
    previous: number;
    change: number;
    changeAmount: number;
  };
  averagePerDay: {
    current: number;
    previous: number;
    change: number;
    changeAmount: number;
  };
  covers: {
    current: number;
    previous: number;
    change: number;
    changeAmount: number;
  };
  labourCosts: {
    current: number;
    previous: number;
    change: number;
    changeAmount: number;
  };
};

export default function RevenuePage() {
  const [currentData, setCurrentData] = useState<RevenueType | null>(null);
  const [previousData, setPreviousData] = useState<RevenueType | null>(null);
  const [chartData, setChartData] = useState<ChartDataType[]>([]);
  const [comparisonMetrics, setComparisonMetrics] =
    useState<ComparisonMetricsType | null>(null);
  const [comparePrevious, setComparePrevious] = useState(false);

  const [showPosRevenue, setShowPosRevenue] = useState(true);
  const [showEatclubRevenue, setShowEatclubRevenue] = useState(true);
  const [showLabourCosts, setShowLabourCosts] = useState(true);

  const [loading, setLoading] = useState(true);

  // Fetch current revenue
  const fetchCurrentRevenue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/revenue/current?period=week');
      setCurrentData(res.data.data);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Unknown error occurred";
      
      toast.error("Failed to load revenue data", {
        description: errorMessage,
      });
      setCurrentData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch previous revenue
  const fetchPreviousRevenue = useCallback(async () => {
    try {
      const res = await api.get('/revenue/previous?period=week');
      setPreviousData(res.data.data);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Unknown error occurred";
      
      toast.error("Failed to load previous period data", {
        description: errorMessage,
      });
      setPreviousData(null);
    }
  }, []);

  // Format data for chart
  const formatChartData = useCallback(
    (current: RevenueType | null, previous: RevenueType | null): ChartDataType[] => {
      if (!current) return [];

      return current.days.map((day, index) => {
        const currentTotal = day.posRevenue + day.eatclubRevenue;
        const previousDay = previous?.days[index];
        const previousTotal = previousDay
          ? previousDay.posRevenue + previousDay.eatclubRevenue
          : 0;

        return {
          day: day.day,
          current: currentTotal,
          previous: previousTotal,
          posCurrent: day.posRevenue,
          eatclubCurrent: day.eatclubRevenue,
          labourCurrent: day.labourCosts,
          posPrevious: previousDay?.posRevenue || 0,
          eatclubPrevious: previousDay?.eatclubRevenue || 0,
          labourPrevious: previousDay?.labourCosts || 0,
          positiveEventImpact: day.positiveEventImpact || 0,
          negativeEventImpact: day.negativeEventImpact || 0,
        };
      });
    },
    []
  );

  // Calculate comparison metrics
  const calculateComparisonMetrics = useCallback(
    (
      current: RevenueType | null,
      previous: RevenueType | null
    ): ComparisonMetricsType | null => {
      if (!current || !previous) return null;

      const calculateChange = (curr: number, prev: number) => ({
        change: prev !== 0 ? Math.round(((curr - prev) / prev) * 1000) / 10 : 0,
        changeAmount: curr - prev,
      });

      const currentLabourCosts = current.days.reduce(
        (sum, day) => sum + day.labourCosts,
        0
      );
      const previousLabourCosts = previous.days.reduce(
        (sum, day) => sum + day.labourCosts,
        0
      );

      return {
        revenue: {
          current: current.totalRevenue,
          previous: previous.totalRevenue,
          ...calculateChange(current.totalRevenue, previous.totalRevenue),
        },
        averagePerDay: {
          current: current.averagePerDay,
          previous: previous.averagePerDay,
          ...calculateChange(current.averagePerDay, previous.averagePerDay),
        },
        covers: {
          current: current.totalCovers,
          previous: previous.totalCovers,
          ...calculateChange(current.totalCovers, previous.totalCovers),
        },
        labourCosts: {
          current: currentLabourCosts,
          previous: previousLabourCosts,
          ...calculateChange(currentLabourCosts, previousLabourCosts),
        },
      };
    },
    []
  );

  // Handle compare toggle
  const handleCompareToggle = async () => {
    const newCompareState = !comparePrevious;
    setComparePrevious(newCompareState);

    if (newCompareState && !previousData) {
      await fetchPreviousRevenue();
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchCurrentRevenue();
  }, [fetchCurrentRevenue]);

  useEffect(() => {
    if (currentData) {
      const formattedData = formatChartData(
        currentData,
        comparePrevious ? previousData : null
      );
      setChartData(formattedData);

      if (comparePrevious && previousData) {
        const metrics = calculateComparisonMetrics(currentData, previousData);
        setComparisonMetrics(metrics);
      } else {
        setComparisonMetrics(null);
      }
    }
  }, [currentData, previousData, comparePrevious, formatChartData, calculateComparisonMetrics]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Button variant="outline" disabled size="sm">
          <Spinner />
          Loading revenue data...
        </Button>
      </div>
    );
  }

  // No data state
  if (!currentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">No revenue data available</p>
          <Button onClick={fetchCurrentRevenue} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-24">
      <Card className="w-full p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-8">
            <h2 className="text-2xl font-bold w-96 flex-shrink-0">
              This Week&apos;s Revenue Trend{" "}
              {comparePrevious && "vs Previous Period"}
            </h2>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={showPosRevenue}
                  onCheckedChange={(checked) =>
                    setShowPosRevenue(checked === true)
                  }
                />
                <span className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-0.5 bg-black"></span>
                  <span>POS Revenue</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={showEatclubRevenue}
                  onCheckedChange={(checked) =>
                    setShowEatclubRevenue(checked === true)
                  }
                />
                <span className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-0.5 bg-indigo-500"></span>
                  <span>Eatclub Revenue</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={showLabourCosts}
                  onCheckedChange={(checked) =>
                    setShowLabourCosts(checked === true)
                  }
                />
                <span className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-0.5 bg-orange-400"></span>
                  <span>Labour Costs</span>
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompareToggle}
              className={
                comparePrevious
                  ? "bg-amber-400 text-black hover:bg-amber-500 border-amber-400"
                  : ""
              }
            >
              <ChartColumn className="mr-2 h-4 w-4" />
              Compare to Previous
            </Button>

            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export PNG
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Revenue Card */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Revenue
            </h3>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-3xl font-bold text-gray-900">
                ${currentData.totalRevenue.toLocaleString()}
              </p>
              {comparePrevious && comparisonMetrics && (
                <>
                  <span className="text-base text-gray-500">
                    vs ${comparisonMetrics.revenue.previous.toLocaleString()}
                  </span>
                  <span
                    className={`text-base font-medium ${
                      comparisonMetrics.revenue.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ({comparisonMetrics.revenue.change >= 0 ? "+" : ""}
                    {comparisonMetrics.revenue.change}%)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Average per Day Card */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Average per Day
            </h3>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-3xl font-bold text-gray-900">
                ${currentData.averagePerDay.toLocaleString()}
              </p>
              {comparePrevious && comparisonMetrics && (
                <>
                  <span className="text-base text-gray-500">
                    vs $
                    {comparisonMetrics.averagePerDay.previous.toLocaleString()}
                  </span>
                  <span
                    className={`text-base font-medium ${
                      comparisonMetrics.averagePerDay.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ({comparisonMetrics.averagePerDay.change >= 0 ? "+" : ""}
                    {comparisonMetrics.averagePerDay.change}%)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Total Covers Card */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Covers
            </h3>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-3xl font-bold text-gray-900">
                {currentData.totalCovers.toLocaleString()}
              </p>
              {comparePrevious && comparisonMetrics && (
                <>
                  <span className="text-base text-gray-500">
                    vs {comparisonMetrics.covers.previous.toLocaleString()}
                  </span>
                  <span
                    className={`text-base font-medium ${
                      comparisonMetrics.covers.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ({comparisonMetrics.covers.change >= 0 ? "+" : ""}
                    {comparisonMetrics.covers.change}%)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-card p-6">
            <ChartBarStacked
              data={chartData}
              showComparison={comparePrevious}
              showPosRevenue={showPosRevenue}
              showEatclubRevenue={showEatclubRevenue}
              showLabourCosts={showLabourCosts}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
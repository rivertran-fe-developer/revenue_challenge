import Revenue from "../models/Revenue.js";

export const getCurrRevenue = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    const currentRevenue = await Revenue.findOne({
      periodType: "current"
    }).sort({ createdAt: -1 });

    if (!currentRevenue) {
      return res.status(404).json({
        success: false,
        message: "No current revenue data found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: currentRevenue,
      period: period
    });
    
  } catch (error) {
    console.error("Error in getCurrRevenue:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

export const getPrevRevenue = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    const previousRevenue = await Revenue.findOne({
      periodType: "previous"
    }).sort({ createdAt: -1 });

    if (!previousRevenue) {
      return res.status(404).json({
        success: false,
        message: "No previous revenue data found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: previousRevenue,
      period: period
    });
    
  } catch (error) {
    console.error("Error in getPrevRevenue:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};
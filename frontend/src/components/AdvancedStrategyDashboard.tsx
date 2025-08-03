import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Grid, 
  BarChart3, 
  DollarSign, 
  Activity,
  Settings,
  Play,
  Pause,
  X,
  RefreshCw,
  Eye,
  Calendar,
  Zap
} from 'lucide-react';
import { useAdvancedLimitOrderStrategies } from '../hooks/useAdvancedStrategies';

interface AdvancedStrategyDashboardProps {
  contractAddress?: string;
  signer?: any;
}

export const AdvancedStrategyDashboard: React.FC<AdvancedStrategyDashboardProps> = ({
  contractAddress = "0x742d35Cc6634C0532925a3b8D88f2DD7C1C1A04d", // Default contract address
  signer
}) => {
  const {
    loading,
    error,
    userOrders,
    initializeContract,
    createTWAPOrder,
    executeTWAPInterval,
    createOptionOrder,
    exerciseOption,
    createDCAOrder,
    executeDCAOrder,
    createGridOrder,
    executeGridOrder,
    createLiquidityPosition,
    cancelOrder,
    getOrderStatus,
    loadUserOrders
  } = useAdvancedLimitOrderStrategies();

  const [activeTab, setActiveTab] = useState('twap');
  const [orderStatuses, setOrderStatuses] = useState<Record<string, any>>({});
  
  // TWAP Form State
  const [twapForm, setTwapForm] = useState({
    tokenIn: '',
    tokenOut: '',
    totalAmount: '',
    intervals: 10,
    intervalDuration: 3600, // 1 hour
    minPricePerToken: '',
    maxPricePerToken: ''
  });

  // Option Form State
  const [optionForm, setOptionForm] = useState({
    underlying: '',
    strikePrice: '',
    premium: '',
    expiry: Math.floor(Date.now() / 1000) + 86400 * 7, // 1 week
    isCall: true,
    collateralAmount: ''
  });

  // DCA Form State
  const [dcaForm, setDcaForm] = useState({
    tokenIn: '',
    tokenOut: '',
    totalAmount: '',
    frequency: 86400, // 1 day
    amountPerExecution: '',
    maxSlippage: 100 // 1%
  });

  // Grid Form State
  const [gridForm, setGridForm] = useState({
    baseToken: '',
    quoteToken: '',
    gridLevels: 10,
    priceStep: '',
    basePrice: '',
    amountPerGrid: ''
  });

  // Liquidity Form State
  const [liquidityForm, setLiquidityForm] = useState({
    token0: '',
    token1: '',
    amount0: '',
    amount1: '',
    lowerTick: -887220,
    upperTick: 887220
  });

  // Initialize contract
  useEffect(() => {
    if (signer && contractAddress) {
      initializeContract(contractAddress, signer);
    }
  }, [signer, contractAddress, initializeContract]);

  // Load order statuses
  useEffect(() => {
    const loadStatuses = async () => {
      const statuses: Record<string, any> = {};
      
      // Load TWAP statuses
      for (const order of userOrders.twap) {
        try {
          const status = await getOrderStatus(order.orderHash, 0);
          statuses[order.orderHash] = status;
        } catch (err) {
          console.error('Failed to load TWAP status:', err);
        }
      }
      
      // Load DCA statuses
      for (const order of userOrders.dca) {
        try {
          const status = await getOrderStatus(order.orderHash, 2);
          statuses[order.orderHash] = status;
        } catch (err) {
          console.error('Failed to load DCA status:', err);
        }
      }
      
      // Load Grid statuses
      for (const order of userOrders.grid) {
        try {
          const status = await getOrderStatus(order.orderHash, 3);
          statuses[order.orderHash] = status;
        } catch (err) {
          console.error('Failed to load Grid status:', err);
        }
      }
      
      setOrderStatuses(statuses);
    };

    if (Object.keys(userOrders).some(key => userOrders[key as keyof typeof userOrders].length > 0)) {
      loadStatuses();
    }
  }, [userOrders, getOrderStatus]);

  // Create TWAP Order
  const handleCreateTWAPOrder = async () => {
    try {
      await createTWAPOrder(twapForm);
      setTwapForm({
        tokenIn: '',
        tokenOut: '',
        totalAmount: '',
        intervals: 10,
        intervalDuration: 3600,
        minPricePerToken: '',
        maxPricePerToken: ''
      });
    } catch (err) {
      console.error('Failed to create TWAP order:', err);
    }
  };

  // Create Option Order
  const handleCreateOptionOrder = async () => {
    try {
      await createOptionOrder(optionForm);
      setOptionForm({
        underlying: '',
        strikePrice: '',
        premium: '',
        expiry: Math.floor(Date.now() / 1000) + 86400 * 7,
        isCall: true,
        collateralAmount: ''
      });
    } catch (err) {
      console.error('Failed to create option order:', err);
    }
  };

  // Create DCA Order
  const handleCreateDCAOrder = async () => {
    try {
      await createDCAOrder(dcaForm);
      setDcaForm({
        tokenIn: '',
        tokenOut: '',
        totalAmount: '',
        frequency: 86400,
        amountPerExecution: '',
        maxSlippage: 100
      });
    } catch (err) {
      console.error('Failed to create DCA order:', err);
    }
  };

  // Create Grid Order
  const handleCreateGridOrder = async () => {
    try {
      await createGridOrder(gridForm);
      setGridForm({
        baseToken: '',
        quoteToken: '',
        gridLevels: 10,
        priceStep: '',
        basePrice: '',
        amountPerGrid: ''
      });
    } catch (err) {
      console.error('Failed to create grid order:', err);
    }
  };

  // Create Liquidity Position
  const handleCreateLiquidityPosition = async () => {
    try {
      await createLiquidityPosition(liquidityForm);
      setLiquidityForm({
        token0: '',
        token1: '',
        amount0: '',
        amount1: '',
        lowerTick: -887220,
        upperTick: 887220
      });
    } catch (err) {
      console.error('Failed to create liquidity position:', err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
            Advanced Limit Order Strategies
          </h1>
          <p className="mt-2 text-lg text-slate-300">
            Create sophisticated trading strategies with TWAP, Options, DCA, Grid Trading, and Concentrated Liquidity
          </p>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Alert className="border-red-500 bg-red-900/20">
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-5"
        >
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">TWAP Orders</p>
                  <p className="text-2xl font-bold text-blue-400">{userOrders.twap.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Options</p>
                  <p className="text-2xl font-bold text-green-400">{userOrders.options.length}</p>
                </div>
                <Target className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">DCA Orders</p>
                  <p className="text-2xl font-bold text-yellow-400">{userOrders.dca.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Grid Orders</p>
                  <p className="text-2xl font-bold text-purple-400">{userOrders.grid.length}</p>
                </div>
                <Grid className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Liquidity</p>
                  <p className="text-2xl font-bold text-pink-400">{userOrders.liquidity.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
              <TabsTrigger value="twap" className="data-[state=active]:bg-blue-600">
                <BarChart3 className="mr-2 h-4 w-4" />
                TWAP
              </TabsTrigger>
              <TabsTrigger value="options" className="data-[state=active]:bg-green-600">
                <Target className="mr-2 h-4 w-4" />
                Options
              </TabsTrigger>
              <TabsTrigger value="dca" className="data-[state=active]:bg-yellow-600">
                <Clock className="mr-2 h-4 w-4" />
                DCA
              </TabsTrigger>
              <TabsTrigger value="grid" className="data-[state=active]:bg-purple-600">
                <Grid className="mr-2 h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="liquidity" className="data-[state=active]:bg-pink-600">
                <DollarSign className="mr-2 h-4 w-4" />
                Liquidity
              </TabsTrigger>
            </TabsList>

            {/* TWAP Tab */}
            <TabsContent value="twap" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Create TWAP Order */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-400">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Create TWAP Order
                    </CardTitle>
                    <CardDescription>
                      Time-Weighted Average Price orders split large trades across multiple intervals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="twap-token-in">Token In</Label>
                        <Input
                          id="twap-token-in"
                          placeholder="0x..."
                          value={twapForm.tokenIn}
                          onChange={(e) => setTwapForm({...twapForm, tokenIn: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="twap-token-out">Token Out</Label>
                        <Input
                          id="twap-token-out"
                          placeholder="0x..."
                          value={twapForm.tokenOut}
                          onChange={(e) => setTwapForm({...twapForm, tokenOut: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="twap-total-amount">Total Amount</Label>
                        <Input
                          id="twap-total-amount"
                          placeholder="1000"
                          value={twapForm.totalAmount}
                          onChange={(e) => setTwapForm({...twapForm, totalAmount: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="twap-intervals">Intervals</Label>
                        <Input
                          id="twap-intervals"
                          type="number"
                          value={twapForm.intervals}
                          onChange={(e) => setTwapForm({...twapForm, intervals: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="twap-min-price">Min Price</Label>
                        <Input
                          id="twap-min-price"
                          placeholder="0.95"
                          value={twapForm.minPricePerToken}
                          onChange={(e) => setTwapForm({...twapForm, minPricePerToken: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="twap-max-price">Max Price</Label>
                        <Input
                          id="twap-max-price"
                          placeholder="1.05"
                          value={twapForm.maxPricePerToken}
                          onChange={(e) => setTwapForm({...twapForm, maxPricePerToken: e.target.value})}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreateTWAPOrder} 
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                      Create TWAP Order
                    </Button>
                  </CardContent>
                </Card>

                {/* TWAP Orders List */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Active TWAP Orders</span>
                      <Button variant="outline" size="sm" onClick={loadUserOrders}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userOrders.twap.length === 0 ? (
                      <p className="text-center text-slate-400">No TWAP orders found</p>
                    ) : (
                      <div className="space-y-3">
                        {userOrders.twap.map((order) => {
                          const status = orderStatuses[order.orderHash];
                          return (
                            <Card key={order.orderHash} className="border-slate-600 bg-slate-700/30">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{formatAddress(order.orderHash)}</p>
                                    {status && (
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Progress</span>
                                          <span>{status.progress.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={status.progress} className="h-2" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => executeTWAPInterval(order.orderHash, "1000")}
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => cancelOrder(order.orderHash, 0)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Options Tab */}
            <TabsContent value="options" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Create Option Order */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-400">
                      <Target className="mr-2 h-5 w-5" />
                      Create Option Order
                    </CardTitle>
                    <CardDescription>
                      Create call or put options with customizable strike prices and expiry
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="option-underlying">Underlying Token</Label>
                        <Input
                          id="option-underlying"
                          placeholder="0x..."
                          value={optionForm.underlying}
                          onChange={(e) => setOptionForm({...optionForm, underlying: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="option-strike">Strike Price</Label>
                        <Input
                          id="option-strike"
                          placeholder="100"
                          value={optionForm.strikePrice}
                          onChange={(e) => setOptionForm({...optionForm, strikePrice: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="option-premium">Premium (ETH)</Label>
                        <Input
                          id="option-premium"
                          placeholder="0.1"
                          value={optionForm.premium}
                          onChange={(e) => setOptionForm({...optionForm, premium: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="option-collateral">Collateral Amount</Label>
                        <Input
                          id="option-collateral"
                          placeholder="1000"
                          value={optionForm.collateralAmount}
                          onChange={(e) => setOptionForm({...optionForm, collateralAmount: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="call-option"
                          name="option-type"
                          checked={optionForm.isCall}
                          onChange={() => setOptionForm({...optionForm, isCall: true})}
                        />
                        <Label htmlFor="call-option">Call Option</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="put-option"
                          name="option-type"
                          checked={!optionForm.isCall}
                          onChange={() => setOptionForm({...optionForm, isCall: false})}
                        />
                        <Label htmlFor="put-option">Put Option</Label>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreateOptionOrder} 
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Target className="mr-2 h-4 w-4" />}
                      Create Option Order
                    </Button>
                  </CardContent>
                </Card>

                {/* Options List */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Active Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userOrders.options.length === 0 ? (
                      <p className="text-center text-slate-400">No option orders found</p>
                    ) : (
                      <div className="space-y-3">
                        {userOrders.options.map((order) => (
                          <Card key={order.orderHash} className="border-slate-600 bg-slate-700/30">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{formatAddress(order.orderHash)}</p>
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant="secondary">
                                      {order.isCall ? 'CALL' : 'PUT'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* DCA Tab */}
            <TabsContent value="dca" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Create DCA Order */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-yellow-400">
                      <Clock className="mr-2 h-5 w-5" />
                      Create DCA Order
                    </CardTitle>
                    <CardDescription>
                      Dollar Cost Averaging spreads purchases over time to reduce volatility impact
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dca-token-in">Token In</Label>
                        <Input
                          id="dca-token-in"
                          placeholder="0x..."
                          value={dcaForm.tokenIn}
                          onChange={(e) => setDcaForm({...dcaForm, tokenIn: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dca-token-out">Token Out</Label>
                        <Input
                          id="dca-token-out"
                          placeholder="0x..."
                          value={dcaForm.tokenOut}
                          onChange={(e) => setDcaForm({...dcaForm, tokenOut: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dca-total-amount">Total Amount</Label>
                        <Input
                          id="dca-total-amount"
                          placeholder="1000"
                          value={dcaForm.totalAmount}
                          onChange={(e) => setDcaForm({...dcaForm, totalAmount: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dca-amount-per-execution">Amount Per Execution</Label>
                        <Input
                          id="dca-amount-per-execution"
                          placeholder="100"
                          value={dcaForm.amountPerExecution}
                          onChange={(e) => setDcaForm({...dcaForm, amountPerExecution: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dca-frequency">Frequency (seconds)</Label>
                        <Input
                          id="dca-frequency"
                          type="number"
                          value={dcaForm.frequency}
                          onChange={(e) => setDcaForm({...dcaForm, frequency: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dca-slippage">Max Slippage (bps)</Label>
                        <Input
                          id="dca-slippage"
                          type="number"
                          value={dcaForm.maxSlippage}
                          onChange={(e) => setDcaForm({...dcaForm, maxSlippage: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreateDCAOrder} 
                      disabled={loading}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                      Create DCA Order
                    </Button>
                  </CardContent>
                </Card>

                {/* DCA Orders List */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Active DCA Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userOrders.dca.length === 0 ? (
                      <p className="text-center text-slate-400">No DCA orders found</p>
                    ) : (
                      <div className="space-y-3">
                        {userOrders.dca.map((order) => {
                          const status = orderStatuses[order.orderHash];
                          return (
                            <Card key={order.orderHash} className="border-slate-600 bg-slate-700/30">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{formatAddress(order.orderHash)}</p>
                                    {status && (
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Progress</span>
                                          <span>{status.progress.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={status.progress} className="h-2" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => executeDCAOrder(order.orderHash, "100")}
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => cancelOrder(order.orderHash, 2)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Grid Trading Tab */}
            <TabsContent value="grid" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Create Grid Order */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-400">
                      <Grid className="mr-2 h-5 w-5" />
                      Create Grid Order
                    </CardTitle>
                    <CardDescription>
                      Grid trading places multiple buy/sell orders at different price levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="grid-base-token">Base Token</Label>
                        <Input
                          id="grid-base-token"
                          placeholder="0x..."
                          value={gridForm.baseToken}
                          onChange={(e) => setGridForm({...gridForm, baseToken: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="grid-quote-token">Quote Token</Label>
                        <Input
                          id="grid-quote-token"
                          placeholder="0x..."
                          value={gridForm.quoteToken}
                          onChange={(e) => setGridForm({...gridForm, quoteToken: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="grid-levels">Grid Levels</Label>
                        <Input
                          id="grid-levels"
                          type="number"
                          value={gridForm.gridLevels}
                          onChange={(e) => setGridForm({...gridForm, gridLevels: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="grid-price-step">Price Step</Label>
                        <Input
                          id="grid-price-step"
                          placeholder="0.01"
                          value={gridForm.priceStep}
                          onChange={(e) => setGridForm({...gridForm, priceStep: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="grid-base-price">Base Price</Label>
                        <Input
                          id="grid-base-price"
                          placeholder="1.0"
                          value={gridForm.basePrice}
                          onChange={(e) => setGridForm({...gridForm, basePrice: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="grid-amount-per-grid">Amount Per Grid</Label>
                        <Input
                          id="grid-amount-per-grid"
                          placeholder="100"
                          value={gridForm.amountPerGrid}
                          onChange={(e) => setGridForm({...gridForm, amountPerGrid: e.target.value})}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreateGridOrder} 
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Grid className="mr-2 h-4 w-4" />}
                      Create Grid Order
                    </Button>
                  </CardContent>
                </Card>

                {/* Grid Orders List */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Active Grid Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userOrders.grid.length === 0 ? (
                      <p className="text-center text-slate-400">No grid orders found</p>
                    ) : (
                      <div className="space-y-3">
                        {userOrders.grid.map((order) => {
                          const status = orderStatuses[order.orderHash];
                          return (
                            <Card key={order.orderHash} className="border-slate-600 bg-slate-700/30">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{formatAddress(order.orderHash)}</p>
                                    {status && (
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Progress</span>
                                          <span>{status.progress.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={status.progress} className="h-2" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => executeGridOrder(order.orderHash, 0, "100")}
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => cancelOrder(order.orderHash, 3)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Liquidity Tab */}
            <TabsContent value="liquidity" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Create Liquidity Position */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-pink-400">
                      <DollarSign className="mr-2 h-5 w-5" />
                      Create Liquidity Position
                    </CardTitle>
                    <CardDescription>
                      Provide concentrated liquidity with custom price ranges
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="liquidity-token0">Token 0</Label>
                        <Input
                          id="liquidity-token0"
                          placeholder="0x..."
                          value={liquidityForm.token0}
                          onChange={(e) => setLiquidityForm({...liquidityForm, token0: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="liquidity-token1">Token 1</Label>
                        <Input
                          id="liquidity-token1"
                          placeholder="0x..."
                          value={liquidityForm.token1}
                          onChange={(e) => setLiquidityForm({...liquidityForm, token1: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="liquidity-amount0">Amount 0</Label>
                        <Input
                          id="liquidity-amount0"
                          placeholder="1000"
                          value={liquidityForm.amount0}
                          onChange={(e) => setLiquidityForm({...liquidityForm, amount0: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="liquidity-amount1">Amount 1</Label>
                        <Input
                          id="liquidity-amount1"
                          placeholder="1000"
                          value={liquidityForm.amount1}
                          onChange={(e) => setLiquidityForm({...liquidityForm, amount1: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="liquidity-lower-tick">Lower Tick</Label>
                        <Input
                          id="liquidity-lower-tick"
                          type="number"
                          value={liquidityForm.lowerTick}
                          onChange={(e) => setLiquidityForm({...liquidityForm, lowerTick: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="liquidity-upper-tick">Upper Tick</Label>
                        <Input
                          id="liquidity-upper-tick"
                          type="number"
                          value={liquidityForm.upperTick}
                          onChange={(e) => setLiquidityForm({...liquidityForm, upperTick: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreateLiquidityPosition} 
                      disabled={loading}
                      className="w-full bg-pink-600 hover:bg-pink-700"
                    >
                      {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
                      Create Liquidity Position
                    </Button>
                  </CardContent>
                </Card>

                {/* Liquidity Positions List */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Active Liquidity Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userOrders.liquidity.length === 0 ? (
                      <p className="text-center text-slate-400">No liquidity positions found</p>
                    ) : (
                      <div className="space-y-3">
                        {userOrders.liquidity.map((position) => (
                          <Card key={position.positionHash} className="border-slate-600 bg-slate-700/30">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{formatAddress(position.positionHash)}</p>
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant="secondary">
                                      Active
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

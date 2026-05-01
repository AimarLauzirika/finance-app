#region Using declarations
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Xml.Serialization;
using NinjaTrader.Cbi;
using NinjaTrader.Gui;
using NinjaTrader.Gui.Chart;
using NinjaTrader.Gui.SuperDom;
using NinjaTrader.Gui.Tools;
using NinjaTrader.Data;
using NinjaTrader.NinjaScript;
using NinjaTrader.Core.FloatingPoint;
using NinjaTrader.NinjaScript.Indicators;
using NinjaTrader.NinjaScript.DrawingTools;
#endregion

using System.IO; // Para usar StreamWriter

//This namespace holds Strategies in this folder and is required. Do not change it. 
namespace NinjaTrader.NinjaScript.Strategies.Mercury.E2tFund50
{
	public class E2tFund50MgcCombTf5 : Strategy
	{
		
		// Exportar
		private E2tFund50MgcCombEnums.Strategies	ExportStrategy	= E2tFund50MgcCombEnums.Strategies.No_exportar;
		// StreamWriter
		private StreamWriter sw; // a variable for the StreamWriter that will be used 
		private string StrategyName;
		private string dir;
		private string version;
		private string path;
		private string folder;
		private string copy;
		private string paste;
		private int totalTrades;
		private int tradeNumber;
		private string tradeInstrument;
		private string tradeStrategy;
		private int tradeQuantity;
		private string tradePosition;
		private string tradeEntryTime;
		private double tradeEntryPrice;
		private string tradeExitTime;
		private double tradeExitPrice;
		private double tradeProfit;
		private double tradeCommission;
		private double tradeMAE;
		private double tradeMFE;
		private int tradeBars;
				
		// Horas
		private int Hora00;
		private int Hora01;
		private int Hora02;
		private int Hora03;
		private int Hora04;
		private int Hora05;
		private int Hora06;
		private int Hora07;
		private int Hora08;
		private int Hora09;
		private int Hora10;
		private int Hora11;
		private int Hora12;
		private int Hora13;
		private int Hora14;
		private int Hora15;
		private int Hora16;
		private int Hora17;
		private int Hora18;
		private int Hora19;
		private int Hora20;
		private int Hora21;
		private int Hora22;
		private int Hora23;
		
		// Account
		private double RealizedProfitLoss;
		private double UnrealizedProfitLoss;
		private double NetLiquidation;
		private double GrossRealizedProfitLoss;
		private double DailyLossLimit;
		private int AccountGoal;
		private int DailyTarget;
		private int DailyLoss;
		private int positions;
		
		// Filtros Festivos y datos defectuosos
		private NinjaTrader.NinjaScript.Indicators.FiltrosEstrategias.DatosDefectuososGC DatosDefectuososGC1;
		private NinjaTrader.NinjaScript.Indicators.FiltrosEstrategias.FestivosCMEGroup FestivosCMEGroup1;
		private NinjaTrader.NinjaScript.Indicators.FiltrosEstrategias.DiferenciaHoraria DiferenciaHoraria1;
		
		// General
		private int PTcurrency;
		private int SLcurrency;
		private bool TradedToday;
		private string Asset;
		private ATR ATRsl;
		private bool AccountEntryConditions;
		private PriorDayOHLC PriorDayOHLC1;

		
		//---------------
		// Friday
		private bool Friday;
		private int Quantity_Friday;
		private bool filterPass_Friday;
		private int Filtros_Friday;
		
		// FiBo
		private bool FiBo;
		private int Quantity_FiBo;
		private double range;
		private double fiboLevel;
		private bool priceBelowFibo;
		private ADX ADX_FiBo;
		private RSI RSI_FiBo;
		private bool filterPass_FiBo;
		private int Filtros_FiBo;
		
		// CuBo Long
		private bool CuBoLong;
		private int Quantity_CuBoLong;
		private CurrentDayOHL CurrentDayOHL_CuBoLong;
		private ADX ADX_CuBoLong;
		private ROC ROC_CuBoLong;
		private RSI RSI_CuBoLong;
		private bool filterPass_CuBoLong;
		private int Filtros_CuBoLong;
		private int Tf_CuBoLong;
		
		// CuBo Short
		private bool CuBoShort;
		private int Quantity_CuBoShort;
		private bool filterPass_CuBoShort;
		private CurrentDayOHL CurrentDayOHL_CuBoShort;
		private ADX ADX_CuBoShort;
		private ROC ROC_CuBoShort;
		private RSI RSI_CuBoShort;
		private int Filtros_CuBoShort;
		private int Tf_CuBoShort;
		private int Qa_CuBoShort;
		
		// PdRe Long
		private bool PdReLong;
		private int Quantity_PdReLong;
		private bool filterPass_PdReLong;
		private ADX ADX_PdReLong;
		private ROC ROC_PdReLong;
		private RSI RSI_PdReLong;
		private int Filtros_PdReLong;
		private int Tf_PdReLong;
		
		// PdRe Short
		private bool PdReShort;
		private int Quantity_PdReShort;
		private bool filterPass_PdReShort;
		private ADX ADX_PdReShort;
		private ROC ROC_PdReShort;
//		private int Filtros_PdReShort;
//		private int Tf_PdReShort;
		
		// R3Bo
		private double HHA;
		private double LLA;
		private double HHB;
		private double LLB;
		private double HHC;
		private double LLC;
		// R3Bo Long
		private bool R3BoLong;
		private int Quantity_R3BoLong;
		private bool filterPass_R3BoLong;
		private int Filtros_R3BoLong;
		private ADX ADX_R3BoLong;
		// R3Bo Short
		private bool R3BoShort;
		private int Quantity_R3BoShort;
		private bool filterPass_R3BoShort;
		private int Filtros_R3BoShort;
		private ADX ADX_R3BoShort;
		
		// PbG Long
		private bool PbGLong;
		private int Quantity_PbGLong;
		private double ATRm;
		private ATR ATR_PbGLong;
		private int ATRmult_PbGLong;
		
		// BBBo Long
		private bool BBBoLong;
		private int Quantity_BBBoLong;
		private bool filterPass_BBBoLong;
		private int Filtros_BBBoLong;
		
		// GannBo Long
		private bool GannBoLong;
		private int Quantity_GannBoLong;
		private bool filterPass_GannBoLong;
		private int Filtros_GannBoLong;
		private bool GannBoLow;
		private double EntryPrice_GannBoLong;
		private GannHiLoActivator GannHiLoActivator_GannBoLong;
		private DonchianChannel DonchianChannel_GannBoLong;
		
		// Monday Short
		private bool MondayShort;
		private int Quantity_MondayShort;
		private bool filterPass_MondayShort;
		private int Filtros_MondayShort;
		private ADX ADX_MondayShort;
		
		
		
		protected override void OnStateChange()
		{
			if (State == State.SetDefaults)
			{
				Description									= @"Estrategia que combina todas las estrategias del S&P500 de E2tEval50. Tf5";
				Name										= "E2tFund50MgcCombTf5";
				Calculate									= Calculate.OnBarClose;
				EntriesPerDirection							= 1;
				EntryHandling								= EntryHandling.AllEntries;
				IsExitOnSessionCloseStrategy				= false;
				ExitOnSessionCloseSeconds					= 30;
				IsFillLimitOnTouch							= false;
				MaximumBarsLookBack							= MaximumBarsLookBack.TwoHundredFiftySix;
				OrderFillResolution							= OrderFillResolution.Standard;
				Slippage									= 0;
				StartBehavior								= StartBehavior.WaitUntilFlat;
				TimeInForce									= TimeInForce.Gtc;
				TraceOrders									= false;
				RealtimeErrorHandling						= RealtimeErrorHandling.StopCancelClose;
				StopTargetHandling							= StopTargetHandling.PerEntryExecution;
				BarsRequiredToTrade							= 20;
				// Disable this property for performance gains in Strategy Analyzer optimizations
				// See the Help Guide for additional information
				IsInstantiatedOnEachOptimizationIteration	= true;
				IncludeCommission							= false;
				
				AccountGoal			= 50510;
				DailyTarget			= 2000;
				DailyLoss			= 1000;
				ExportStrategy 		= E2tFund50MgcCombEnums.Strategies.No_exportar;
				
				Friday				= false;
				Filtros_Friday		= 0; // 0-1
				
				FiBo				= true;
				Filtros_FiBo		= 0; // 0-3
				
				CuBoLong			= true;
				Filtros_CuBoLong	= 2; // 0-3
				Tf_CuBoLong			= 4; // 3-5
				
				CuBoShort			= true;
				Filtros_CuBoShort	= 1; // 0-3
				Tf_CuBoShort		= 3; // 3-5
				Qa_CuBoShort		= 3; // 0-3
				
				PdReLong			= true;
				Filtros_PdReLong	= 3; // 0-3
				Tf_PdReLong			= 3; // 2-4
				
				PdReShort			= false;
				Filtros_PdReShort	= 1; // 0-2
				Tf_PdReShort		= 3; // 2-4
				
				R3BoLong			= true;
				Filtros_R3BoLong	= 1; // 0-1
				
				R3BoShort			= true;
				Filtros_R3BoShort	= 1; // 0-1
				
				PbGLong				= true;
				ATRmult_PbGLong		= 3; // 1-4
				
				BBBoLong			= true;
				Filtros_BBBoLong	= 0; // 0-2
				
				GannBoLong			= true;
				
				MondayShort			= false;
				Filtros_MondayShort	= 0; // 0-1
				
				
			}
			else if (State == State.Configure)
			{
				AddDataSeries(Data.BarsPeriodType.Day, 1); // Closes[1]
				AddDataSeries(Data.BarsPeriodType.Minute, 15); // Closes[2]
				AddDataSeries(Data.BarsPeriodType.Minute, 30); // Closes[3]
				AddDataSeries(Data.BarsPeriodType.Minute, 60); // Closes[4]
				AddDataSeries(Data.BarsPeriodType.Minute, 120); // Closes[5]
				AddDataSeries(Data.BarsPeriodType.Minute, 240); // Closes[6]
				
				/// Exports
				// Friday
				if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.Friday) Friday = true;
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar && ExportStrategy != E2tFund50MgcCombEnums.Strategies.Friday) Friday = false;
				// FiBo
				if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.FiBo) FiBo = true;
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar && ExportStrategy != E2tFund50MgcCombEnums.Strategies.FiBo) FiBo = false;
				// CuBoLong
				if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.CuBoLong) CuBoLong = true;
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar && ExportStrategy != E2tFund50MgcCombEnums.Strategies.CuBoLong) CuBoLong = false;
				// CuBoShort
				if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.CuBoShort) CuBoShort = true;
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar && ExportStrategy != E2tFund50MgcCombEnums.Strategies.CuBoShort) CuBoShort = false;
				// PdReLong
				if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.PdReLong) PdReLong = true;
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar && ExportStrategy != E2tFund50MgcCombEnums.Strategies.PdReLong) PdReLong = false;
				// PdReShort
				if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.PdReShort) PdReShort = true;
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar && ExportStrategy != E2tFund50MgcCombEnums.Strategies.PdReShort) PdReShort = false;
				// R3BoLong
				if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.R3BoLong) R3BoLong = true;
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar && ExportStrategy != E2tFund50MgcCombEnums.Strategies.R3BoLong) R3BoLong = false;
				// R3BoShort
				if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.R3BoShort) R3BoShort = true;
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar && ExportStrategy != E2tFund50MgcCombEnums.Strategies.R3BoShort) R3BoShort = false;
				// PbGLong
				if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.PbGLong) PbGLong = true;
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar && ExportStrategy != E2tFund50MgcCombEnums.Strategies.PbGLong) PbGLong = false;
				// BBBoLong
				if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.BBBoLong) BBBoLong = true;
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar && ExportStrategy != E2tFund50MgcCombEnums.Strategies.BBBoLong) BBBoLong = false;
				// GannBoLong
				if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.GannBoLong) GannBoLong = true;
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar && ExportStrategy != E2tFund50MgcCombEnums.Strategies.GannBoLong) GannBoLong = false;

			}
			else if (State == State.DataLoaded)
			{	
				Asset = Instrument.FullName.Split()[0];
				if (Asset == "GC") {
					PTcurrency = 5100;
					SLcurrency = 5000;
				} else if (Asset == "MGC") {
					PTcurrency = 510;
					SLcurrency = 500;
				} else {
					Print("Es necesario utilizar GC o MGC");
					return;
				}
				
//				SetProfitTarget(CalculationMode.Currency, Math.Min(ProfitTarget, (AccountGoal - NetLiquidation)));
				SetProfitTarget(CalculationMode.Currency, PTcurrency);
				SetStopLoss(CalculationMode.Currency, SLcurrency);
				
				DatosDefectuososGC1				= DatosDefectuososGC(Close);
				FestivosCMEGroup1				= FestivosCMEGroup(Close);
				DiferenciaHoraria1				= DiferenciaHoraria(Close);
				
				PriorDayOHLC1					= PriorDayOHLC(Close);
				PriorDayOHLC1.Plots[0].Brush	= Brushes.Transparent;
				PriorDayOHLC1.Plots[1].Brush	= Brushes.DarkCyan;
				PriorDayOHLC1.Plots[2].Brush	= Brushes.Crimson;
				PriorDayOHLC1.Plots[3].Brush	= Brushes.Transparent;
				AddChartIndicator(PriorDayOHLC1);
				ATRsl						= ATR(Closes[1], 14);
				
				ADX_FiBo					= ADX(Closes[1], 6);
				RSI_FiBo					= RSI(Closes[1], 11, 1);
				
				CurrentDayOHL_CuBoLong		= CurrentDayOHL(Closes[Tf_CuBoLong]);
				ADX_CuBoLong				= ADX(Closes[1], 7);
				ROC_CuBoLong				= ROC(Closes[1], 10);
				RSI_CuBoLong				= RSI(Closes[1], 11, 3);
				
				CurrentDayOHL_CuBoShort		= CurrentDayOHL(Closes[Tf_CuBoShort]);
				ADX_CuBoShort				= ADX(Closes[1], 4);
				ROC_CuBoShort				= ROC(Closes[1], 5);
				RSI_CuBoShort				= RSI(Closes[1], 2, 3);
				
				ADX_PdReLong				= ADX(Closes[1], 10);
				ROC_PdReLong				= ROC(Closes[1], 11);
				RSI_PdReLong				= RSI(Closes[1], 16, 3);
				
				ADX_PdReShort				= ADX(Closes[1], 6);
				ROC_PdReShort				= ROC(Closes[1], 5);
				
				ADX_R3BoLong				= ADX(Closes[4], 14);
				
				ADX_R3BoShort				= ADX(Closes[4], 14);

				ATR_PbGLong					= ATR(Closes[6], 10);
				ATRm 						= ATRmult_PbGLong * 0.1;
				
				GannHiLoActivator_GannBoLong	= GannHiLoActivator(Closes[4], 5);
				DonchianChannel_GannBoLong		= DonchianChannel(Closes[4], 51);
				
				/// Export
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar)
				{
					StrategyName = Name.Replace("Comb", " ").Split()[0] + Exportar_Estrategia;
					dir = NinjaTrader.Core.Globals.UserDataDir + "\\Trades\\" + StrategyName;
					// Friday
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.Friday) 
						version = "F" + Filtros_Friday;
					// FiBo
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.FiBo) 
						version = "F" + Filtros_FiBo;
					// CuBoLong
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.CuBoLong) 
						version = "F" + Filtros_CuBoLong + "Tf" + Tf_CuBoLong;
					// CuBoShort
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.CuBoShort) 
						version = "Qa" + Qa_CuBoShort + "F" + Filtros_CuBoShort + "Tf" + Tf_CuBoShort;
					// PdReLong
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.PdReLong) 
						version = "F" + Filtros_PdReLong + "Tf" + Tf_PdReLong;
					// PdReShort
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.PdReShort) 
						version = "F" + Filtros_PdReShort + "Tf" + Tf_PdReShort;
					// R3BoLong
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.R3BoLong) 
						version = "F" + Filtros_R3BoLong;
					// R3BoShort
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.R3BoShort) 
						version = "F" + Filtros_R3BoShort;
//					// PbGLong
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.PbGLong) 
						version = "Am" + ATRmult_PbGLong;
					// BBBoLong
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.BBBoLong) 
						version = "F" + Filtros_BBBoLong;
					// GannBoLong
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.GannBoLong) 
						version = "";
					// MondayShort
					if (ExportStrategy == E2tFund50MgcCombEnums.Strategies.MondayShort) 
						version = "F" + Filtros_MondayShort;
					
//					version = "Q" + Quantity + "Eh" + EntryHour + "Tf" + BarsPeriod.Value;
					path = dir + "\\" + StrategyName + version + ".csv"; // Define the Path to our test file
					
					// Crear directorio
					System.IO.Directory.CreateDirectory(dir);
					
					// Create fichero
					if(File.Exists(path))
					{
					    File.Delete(path);
					}
					
					sw = File.AppendText(path);  // Open the path for writing
					sw.WriteLine("Trade;Instrument;Strategy;Version;Qty;Direction;Entry time;Entry price;Exit time;ExitPrice;Profit;Commission;MAE;MFE"); // Append a new line to the file
					sw.Close(); // Close the file to allow future calls to access the file again.
				}
				
			}
			
			/// Export
			else if (State == State.Terminated)
			{
				if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar) 
				{
					exportTrades();
					
					// guardar fichero código
					folder = "bin\\Custom\\" + this.GetType().Namespace.Replace("NinjaTrader.NinjaScript.","").Replace(".","\\") + "\\";
					copy = NinjaTrader.Core.Globals.UserDataDir + folder + Name + ".cs";
					paste = dir + "\\" + Name + ".cs";
					
					if(File.Exists(paste))
					{
					    File.Delete(paste);
					}
					File.Copy(copy, paste);
				}
			}
			
		}

		
		protected override void OnBarUpdate()
		{
			if (BarsInProgress != 0) 
				return;

			if (CurrentBars[0] < 1
				|| CurrentBars[1] < 1
				|| CurrentBars[2] < 1
				|| CurrentBars[3] < 1
				|| CurrentBars[4] < 1
				|| CurrentBars[5] < 1
				|| CurrentBars[6] < 1
				)
				return;
			
			// Actualizar info cuenta
			RealizedProfitLoss = Account.Get(AccountItem.RealizedProfitLoss, Currency.UsDollar);
			UnrealizedProfitLoss = Account.Get(AccountItem.UnrealizedProfitLoss, Currency.UsDollar);
			NetLiquidation = Account.Get(AccountItem.NetLiquidation, Currency.UsDollar);
			GrossRealizedProfitLoss = Account.Get(AccountItem.GrossRealizedProfitLoss, Currency.UsDollar);
			DailyLossLimit = Account.Get(AccountItem.DailyLossLimit, Currency.UsDollar);
			positions = 0;
			foreach (Position position in Account.Positions){
				positions = positions + 1;
			}
//			if (Position.MarketPosition != MarketPosition.Flat) TradedToday = true;
			if (Position.MarketPosition != MarketPosition.Flat && 
				(Position.Instrument.FullName.Split()[0] == "GC" || Position.Instrument.FullName.Split()[0] == "MGC")) TradedToday = true;

			
			// Objetivo de la cuenta
			if (NetLiquidation >= AccountGoal + 20
			){
				ExitLong("Objetivo de la cuenta","");
				ExitShort("Objetivo de la cuenta","");
				return;
			}
			
			// Objetivo del día
			if (RealizedProfitLoss + UnrealizedProfitLoss >= DailyTarget){
				ExitLong("Objetivo del día","");
				ExitShort("Objetivo del día","");

				return;
			}
			// Pérdida diaria
			if (RealizedProfitLoss + UnrealizedProfitLoss <= -DailyLoss){
				ExitLong("Pérdida diaria","");
				ExitShort("Pérdida diaria","");

				return;
			}
			
			// Datos defectuosos GC
			if (DatosDefectuososGC1[0] == 0)
			{
				ExitLong("Día de datos defectuosos","");
				ExitShort("Día de datos defectuosos","");
				return;
			}
			
			// Diferencia horaria
			Hora00 = 0;
			Hora01 = 1;
			Hora02 = 2;
			Hora03 = 3;
			Hora04 = 4;
			Hora05 = 5;
			Hora06 = 6;
			Hora07 = 7;
			Hora08 = 8;
			Hora09 = 9;
			Hora10 = 10;
			Hora11 = 11;
			Hora12 = 12;
			Hora13 = 13;
			Hora14 = 14;
			Hora15 = 15;
			Hora16 = 16;
			Hora17 = 17;
			Hora18 = 18;
			Hora19 = 19;
			Hora20 = 20;
			Hora21 = 21;
			Hora22 = 22;
			Hora23 = 23;
			if (DiferenciaHoraria1[0] == 1)
			{
				Hora01 = Hora01 - 1;
				Hora02 = Hora02 - 1;
				Hora03 = Hora03 - 1;
				Hora04 = Hora04 - 1;
				Hora05 = Hora05 - 1;
				Hora06 = Hora06 - 1;
				Hora07 = Hora07 - 1;
				Hora08 = Hora08 - 1;
				Hora09 = Hora09 - 1;
				Hora10 = Hora10 - 1;
				Hora11 = Hora11 - 1;
				Hora12 = Hora12 - 1;
				Hora13 = Hora13 - 1;
				Hora14 = Hora14 - 1;
				Hora15 = Hora15 - 1;
				Hora16 = Hora16 - 1;
				Hora17 = Hora17 - 1;
				Hora18 = Hora18 - 1;
				Hora19 = Hora19 - 1;
				Hora20 = Hora20 - 1;
				Hora21 = Hora21 - 1;
				Hora22 = Hora22 - 1;
				Hora23 = Hora23 - 1;
			}
			
			// Festivos
			if (FestivosCMEGroup1[0] != 1 
				&& Times[0][0].TimeOfDay > new TimeSpan(Hora14, 00, 0))
			{
				ExitLong("Festivo","");
				ExitShort("Festivo","");
				return;
			}
			if (FestivosCMEGroup1[0] != 1 
				&& Times[0][0].TimeOfDay > new TimeSpan(Hora12, 00, 0)
				&& Position.MarketPosition == MarketPosition.Flat
			)
			{
				ExitLong("Festivo","");
				ExitShort("Festivo","");
				return;
			}
			
			
			// Fin de sesión

			if (Time[0].TimeOfDay >= new TimeSpan(Hora21, 0, 0))
			{
//				ExitLong("Fin de sesión", "");
				ExitShort("Fin de sesión", "R3Bo Short");

			}
			if (Time[0].TimeOfDay >= new TimeSpan(Hora22, 30, 0))
			{
				ExitLong("Fin de sesión", "");
				ExitShort("Fin de sesión", "");

			}
			
			// RESET
			if (Bars.IsFirstBarOfSession && BarsPeriod.Value == 5){ 
				
				TradedToday = false;
				priceBelowFibo = false;
				GannBoLow = false;
			
			}
			
			
								
			
			/// --- ENTRIES --- ///
			 
			AccountEntryConditions = false;
			if (
				RealizedProfitLoss + UnrealizedProfitLoss > -DailyLoss
				&& RealizedProfitLoss + UnrealizedProfitLoss < DailyTarget
				&& positions < 2  
				&& !TradedToday
			)
			{
				AccountEntryConditions = true;
			}
			
			// ----------------- //
			// ** Friday Long ** //
			// ----------------- //
			
			if ((Friday && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.Friday) {
				
				// Filtros
				filterPass_Friday = false;
				if (Filtros_Friday == 0) filterPass_Friday = true;
				if (Filtros_Friday == 1 && PriorDayOHLC1.PriorClose[1] < PriorDayOHLC1.PriorOpen[1]) filterPass_Friday = true;
				
				
				if (
					Times[0][0].DayOfWeek == DayOfWeek.Friday
					&& Times[4][0].TimeOfDay < new TimeSpan(Hora21, 00, 0)
					&& Times[4][0].TimeOfDay > new TimeSpan(Hora02, 0, 0)
					&& filterPass_Friday
					&& AccountEntryConditions
				)
				{
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] - ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_Friday = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) ));
					if (Quantity_Friday < 1) Quantity_Friday = 1;
					
					EnterLong(Quantity_Friday, "Friday Long");
					TradedToday = true;
					return;
				}
			}
			
			// --------------- //
			// ** FiBo Long ** //
			// --------------- //
			
			if ((FiBo && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.FiBo) {
				
				//Fibonacci
				range = PriorDayOHLC1.PriorHigh[0] - PriorDayOHLC1.PriorLow[0];
				fiboLevel = PriorDayOHLC1.PriorHigh[0] - (Math.Round(range * 0.618, 1));
				if (Low[0] <= fiboLevel){
					priceBelowFibo = true;
				}
				
				// Filtros
				filterPass_FiBo = false;
				if (Filtros_FiBo == 0) filterPass_FiBo = true;
				if (Filtros_FiBo == 1 && ADX_FiBo[0] < 40) filterPass_FiBo = true;
				if ( Filtros_FiBo == 2 && RSI_FiBo[0] > 50) filterPass_FiBo = true;
				if ( Filtros_FiBo == 3 && ADX_FiBo[0] < 40 && RSI_FiBo[0] > 50) filterPass_FiBo = true;
	
				if (
					filterPass_FiBo
					&& priceBelowFibo 
					&& Time[0].TimeOfDay < new TimeSpan(Hora21, 00, 0)
					&& Time[0].TimeOfDay > new TimeSpan(Hora02, 0, 0)
					&& Closes[4][1] < PriorDayOHLC1.PriorHigh[0]
					&& Closes[4][0] > PriorDayOHLC1.PriorHigh[0]
					&& AccountEntryConditions
				){
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] - ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_FiBo = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) ));
					if (Quantity_FiBo < 1) Quantity_FiBo = 1;
					
					EnterLong(Quantity_FiBo, "FiBo Long");
					TradedToday = true;
					return;
				}
			}
			
			// --------------- //
			// ** CuBo Long ** //
			// --------------- //
			
			if ((CuBoLong && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.CuBoLong) {
			
				
				//Filtros
				filterPass_CuBoLong = false;
				if (Filtros_CuBoLong == 0) filterPass_CuBoLong = true;
				if (Filtros_CuBoLong == 1 && ADX_CuBoLong[0] > 30) filterPass_CuBoLong = true;
				if (Filtros_CuBoLong == 2 && ROC_CuBoLong[0] > 0) filterPass_CuBoLong = true;
				if (Filtros_CuBoLong == 3 && RSI_CuBoLong[0] > 50) filterPass_CuBoLong = true;
				
				if (Times[Tf_CuBoLong][0].TimeOfDay > new TimeSpan(Hora16, 0, 0)
					&& Times[Tf_CuBoLong][0].TimeOfDay < new TimeSpan(Hora22, 0, 0)
					&& (Closes[Tf_CuBoLong][0] > CurrentDayOHL_CuBoLong.CurrentHigh[1])
					&& filterPass_CuBoLong
					&& AccountEntryConditions
				)
				{
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] - ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_CuBoLong = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) ));
					if (Quantity_CuBoLong < 1) Quantity_CuBoLong = 1;
					
					EnterLong(Quantity_CuBoLong, "CuBo Long");
					TradedToday = true;
					return;
				}
				
			}
			
			// --------------- //
			// ** CuBo Short ** //
			// --------------- //
			
			if ((CuBoShort && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.CuBoShort) {
			
				
				filterPass_CuBoShort = false;
				if (Filtros_CuBoShort == 0) filterPass_CuBoShort = true;
				if (Filtros_CuBoShort == 1 && ADX_CuBoShort[0] > 40) filterPass_CuBoShort = true;
				if (Filtros_CuBoShort == 2 && ROC_CuBoShort[0] < 0) filterPass_CuBoShort = true;
				if (Filtros_CuBoShort == 3 && RSI_CuBoShort[0] < 60) filterPass_CuBoShort = true;
				
				
				if (Times[Tf_CuBoShort][0].TimeOfDay > new TimeSpan(Hora16, 0, 0)
					&& Times[Tf_CuBoShort][0].TimeOfDay < new TimeSpan(Hora22, 0, 0)
					&& (Closes[Tf_CuBoShort][0] < CurrentDayOHL_CuBoShort.CurrentLow[1])
					&& filterPass_CuBoShort
					&& AccountEntryConditions
				)
				{
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] + ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_CuBoShort = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) )) + Qa_CuBoShort;
					if (Quantity_CuBoShort < 1) Quantity_CuBoShort = 1;
					
					EnterShort(Quantity_CuBoShort, "CuBo Short");
					TradedToday = true;
					return;
				}
			}
			
			// --------------- //
			// ** PdRe Long ** //
			// --------------- //
			
			if ((PdReLong && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.PdReLong) {
				
				filterPass_PdReLong = false;
				if (Filtros_PdReLong == 0) filterPass_PdReLong = true;
				if (Filtros_PdReLong == 1 && ADX_PdReLong[0] > 30) filterPass_PdReLong = true;
				if (Filtros_PdReLong == 2 && ROC_PdReLong[0] < 0) filterPass_PdReLong = true;
				if (Filtros_PdReLong == 3 && RSI_PdReLong[0] < 50) filterPass_PdReLong = true;
				
				if (Times[Tf_PdReLong][0].TimeOfDay < new TimeSpan(Hora22, 0, 0)
					&& (Closes[Tf_PdReLong][1] < PriorDayOHLC1.PriorLow[0])
					&& (Closes[Tf_PdReLong][0] > PriorDayOHLC1.PriorLow[0])
					&& filterPass_PdReLong
					&& AccountEntryConditions
				)
				{
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] - ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_PdReLong = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) ));
					if (Quantity_PdReLong < 1) Quantity_PdReLong = 1;
					
					EnterLong(Quantity_PdReLong, "PdRe Long");
					TradedToday = true;
					return;
				}
			}
			
			// ---------------- //
			// ** PdRe Short ** //
			// ---------------- //
			
			if ((PdReShort && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.PdReShort) {
			
				// Filtros
				filterPass_PdReShort = false;
				if (Filtros_PdReShort == 0) filterPass_PdReShort = true;
				if (Filtros_PdReShort == 1 && ADX_PdReShort[0] > 40) filterPass_PdReShort = true;
				if (Filtros_PdReShort == 2 && ROC_PdReShort[0] > 1) filterPass_PdReShort = true;
				
				
				
				if (Times[Tf_PdReShort][0].TimeOfDay < new TimeSpan(Hora22, 0, 0)
					&& (Closes[Tf_PdReShort][1] > PriorDayOHLC1.PriorHigh[0])
					&& (Closes[Tf_PdReShort][0] < PriorDayOHLC1.PriorHigh[0])
					&& filterPass_PdReShort
					&& AccountEntryConditions
				)
				{
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] - ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_PdReShort = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) ));
					if (Quantity_PdReShort < 1) Quantity_PdReShort = 1;
					
					EnterShort(Quantity_PdReShort, "PdRe Short");
					TradedToday = true;
					return;
				}
			}
			
			// --------------- //
			// ** R3Bo Long ** //
			// --------------- //
			
			HHA = MAX(Highs[4], 70)[0];
			HHB = MAX(Highs[4], 20)[0];
			HHC = MAX(Highs[4], 3)[0];
			LLA = MIN(Lows[4], 70)[0];
			LLB = MIN(Lows[4], 20)[0];
			LLC = MIN(Lows[4], 3)[0];
				
			if ((R3BoLong && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.R3BoLong) {
			
				// Filtros
				filterPass_R3BoLong = false;
				if (Filtros_R3BoLong == 0 ) filterPass_R3BoLong = true;
				if (Filtros_R3BoLong == 1 && ADX_R3BoLong[0] > 20) filterPass_R3BoLong = true;
				
				// Entry
				if (HHA > HHB
					&& LLA < LLB
					&& HHB > HHC
					&& LLB < LLC
					&& Times[0][0].TimeOfDay >= new TimeSpan(Hora04, 0, 0)
					&& Times[0][0].TimeOfDay < new TimeSpan(Hora20, 0, 0)
					&& Closes[0][0] < HHB
					&& filterPass_R3BoLong
					&& AccountEntryConditions
				)
				{
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] - ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_R3BoLong = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) ));
					if (Quantity_R3BoLong < 1) Quantity_R3BoLong = 1;
					
					EnterLongStopLimit(Quantity_R3BoLong, HHB, HHB, "R3Bo Long");
					return;
				}
			}
			
			// ---------------- //
			// ** R3Bo Short ** //
			// ---------------- //
			
			if ((R3BoShort && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.R3BoShort) {
			
				
				// Filter
				filterPass_R3BoShort = false;
				if (Filtros_R3BoShort == 0 ) filterPass_R3BoShort = true;
				if (Filtros_R3BoShort == 1 && ADX_R3BoShort[0] > 20) filterPass_R3BoShort = true;
				
				// Entry
				if (HHA > HHB
					&& LLA < LLB
					&& HHB > HHC
					&& LLB < LLC
					&& Times[0][0].TimeOfDay >= new TimeSpan(Hora04, 0, 0)
					&& Times[0][0].TimeOfDay < new TimeSpan(Hora20, 0, 0)
					&& Closes[0][0] > LLB
					&& filterPass_R3BoShort
					&& AccountEntryConditions
				)
				{
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] - ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_R3BoShort = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) ));
					if (Quantity_R3BoShort < 1) Quantity_R3BoShort = 1;
					
					EnterShortStopLimit(Quantity_R3BoShort, LLB, LLB, "R3Bo Short");
					return;
				}
			}
			
			// -------------- //
			// ** PbG Long ** //
			// -------------- //
			
			if ((PbGLong && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.PbGLong) {
			
				
				if (
					Closes[6][0] > Closes[6][1]
					&& Times[6][0].TimeOfDay > new TimeSpan(Hora14, 0, 0)
					&& Times[6][0].TimeOfDay < new TimeSpan(Hora18, 0, 0)
					&& (Time[0].DayOfWeek == DayOfWeek.Friday || Time[0].DayOfWeek == DayOfWeek.Thursday)
					&& AccountEntryConditions
					)
				{
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] - ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_PbGLong = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) ));
					if (Quantity_PbGLong < 1) Quantity_PbGLong = 1;
					
					// Orden límite sólo dura una vela
					EnterLongStopLimit(Quantity_PbGLong, (Closes[6][0] + ((ATR_PbGLong[0] * ATRm) )) , (Closes[6][0] + ((ATR_PbGLong[0] * ATRm) )) , "PbG Long");
					// Orden límite dura hasta cancelar la orden
	//				EnterLongStopLimit(0, true, Quantity_PbGLong, (Close[0] + ((ATR_PbGLong[0] * ATRm) )) , (Close[0] + ((ATR_PbGLong[0] * ATRm) )) , "PbG Long");
					return;
				}
			}
			
			// ----------------- //
			// ** BBBo Long ** //
			// ----------------- //
			
			if ((BBBoLong && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.BBBoLong) {
			
				// Filtros
				filterPass_BBBoLong = false;
				if (Filtros_BBBoLong == 0) filterPass_BBBoLong = true;
				if (Filtros_BBBoLong == 1 && PriorDayOHLC1.PriorClose[1] < PriorDayOHLC1.PriorOpen[1]) filterPass_BBBoLong = true;
				if (Filtros_BBBoLong == 2 && SMA(Closes[4], 20)[0] < Closes[4][0]) filterPass_BBBoLong = true;
				
				
				if (
					Times[4][0].TimeOfDay < new TimeSpan(Hora21, 00, 0)
					&& Times[4][0].TimeOfDay > new TimeSpan(Hora02, 0, 0)
					&& Closes[4][0] < Bollinger(Close, 2, 200)[0]
					&& filterPass_BBBoLong
					&& AccountEntryConditions
				)
				{
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] - ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_BBBoLong = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) ));
					if (Quantity_BBBoLong < 1) Quantity_BBBoLong = 1;
					
					EnterLongStopLimit(Quantity_BBBoLong, Bollinger(Close, 2, 200)[0] , Bollinger(Close, 2, 200)[0] , "BBBo Long");
					return;
				}
			}
			
			// ----------------- //
			// ** GannBo Long ** //
			// ----------------- //
			
			if ((GannBoLong && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.GannBoLong) {
			
				
				if (Lows[4][0] < GannHiLoActivator_GannBoLong[0])
				{
					GannBoLow = true;
					EntryPrice_GannBoLong = DonchianChannel_GannBoLong.Upper[0];
				}
				
//				filterPass_GannBoLong = false;
//				if (Filtros_GannBoLong == 0) filterPass_GannBoLong = true;
//				if (Filtros_GannBoLong == 1 && PriorDayOHLC1.PriorClose[1] < PriorDayOHLC1.PriorOpen[1]) filterPass_GannBoLong = true;
				
				
				if (
					GannBoLow
					&& Times[0][0].TimeOfDay > new TimeSpan(Hora01, 0, 0)
					&& Times[0][0].TimeOfDay < new TimeSpan(Hora20, 0, 0)
					&& Closes[4][0] < EntryPrice_GannBoLong
					&& AccountEntryConditions
				)
				{
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] - ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_GannBoLong = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) ));
					if (Quantity_GannBoLong < 1) Quantity_GannBoLong = 1;
					
					EnterLongStopLimit(Quantity_GannBoLong, EntryPrice_GannBoLong , EntryPrice_GannBoLong , "GannBo Long");
					return;
				}
			}
			
			// ------------------ //
			// ** Monday Short ** //
			// ------------------ //
			
			if ((MondayShort && ExportStrategy == E2tFund50MgcCombEnums.Strategies.No_exportar) || ExportStrategy == E2tFund50MgcCombEnums.Strategies.MondayShort) {
			
				
				// Filtros
				filterPass_MondayShort = false;
				if (Filtros_MondayShort == 0) filterPass_MondayShort = true;
				if (Filtros_MondayShort == 1 && PriorDayOHLC1.PriorClose[1] < PriorDayOHLC1.PriorOpen[1]) filterPass_MondayShort = true;
				
				
				if (
					Time[0].DayOfWeek == DayOfWeek.Monday
					&& filterPass_MondayShort
					&& AccountEntryConditions
				)
				{
					
					// SL
					double ATRslm			= ATRsl[1] * (10 * 0.1);
					double SLpriceATR		= Closes[4][1] - ATRslm;
					double SLcurrencyATR	= ATRslm * Bars.Instrument.MasterInstrument.PointValue;
		
					// Quantity
					int Quantity_MondayShort = Convert.ToInt32(Math.Floor( (SLcurrency / SLcurrencyATR) ));
					if (Quantity_MondayShort < 1) Quantity_GannBoLong = 1;
					
					EnterShort(Quantity_MondayShort, "Monday Short");
					return;
				}
			}
			
			
		}
		
		#region Properties
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Filtros_Friday", Order=2, GroupName="Parameters")]
//		public int Filtros_Friday
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Filtros_FiBo", Order=2, GroupName="Parameters")]
//		public int Filtros_FiBo
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Filtros_CuBoLong", Order=1, GroupName="Parameters")]
//		public int Filtros_CuBoLong
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Tf_CuBoLong", Order=2, GroupName="Parameters")]
//		public int Tf_CuBoLong
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Filtros_CuBoShort", Order=1, GroupName="Parameters")]
//		public int Filtros_CuBoShort
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Tf_CuBoShort", Order=2, GroupName="Parameters")]
//		public int Tf_CuBoShort
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Qa_CuBoShort", Order=3, GroupName="Parameters")]
//		public int Qa_CuBoShort
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Filtros_PdReLong", Order=1, GroupName="Parameters")]
//		public int Filtros_PdReLong
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Tf_PdReLong", Order=2, GroupName="Parameters")]
//		public int Tf_PdReLong
//		{ get; set; }
		
		[NinjaScriptProperty]
		[Range(0, int.MaxValue)]
		[Display(Name="Filtros_PdReShort", Order=1, GroupName="Parameters")]
		public int Filtros_PdReShort
		{ get; set; }
		
		[NinjaScriptProperty]
		[Range(0, int.MaxValue)]
		[Display(Name="Tf_PdReShort", Order=2, GroupName="Parameters")]
		public int Tf_PdReShort
		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Filtros_R3BoLong", Order=2, GroupName="Parameters")]
//		public int Filtros_R3BoLong
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Filtros_R3BoShort", Order=2, GroupName="Parameters")]
//		public int Filtros_R3BoShort
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="ATRmult_PbGLong", Order=2, GroupName="Parameters")]
//		public int ATRmult_PbGLong
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Filtros_BBBoLong", Order=2, GroupName="Parameters")]
//		public int Filtros_BBBoLong
//		{ get; set; }
		
//		[NinjaScriptProperty]
//		[Range(0, int.MaxValue)]
//		[Display(Name="Filtros_MondayShort", Order=2, GroupName="Parameters")]
//		public int Filtros_MondayShort
//		{ get; set; }
		
		
		[Display(GroupName = "Export", Description="Exportar operaciones de una estrategia.")]
		public E2tFund50MgcCombEnums.Strategies Exportar_Estrategia
		{
			get { return ExportStrategy; }
			set { ExportStrategy = value; }
		}
		
		#endregion
	
		#region Helpers
		
		private void exportTrades()
		{
			if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar)
			{
				if (sw != null)
				{
					sw.Close();
					sw.Dispose();
					sw = null;
				}
			}
			
			tradeStrategy = Name;
			if (ExportStrategy != E2tFund50MgcCombEnums.Strategies.No_exportar) tradeStrategy = Convert.ToString(ExportStrategy);
			
			totalTrades = SystemPerformance.AllTrades.Count;
			for (int i = 0; i < totalTrades; i++)
			{
//					Print("#"+ tradeNumber + ": " + SystemPerformance.AllTrades[i].Commission);
				tradeNumber = SystemPerformance.AllTrades[i].TradeNumber + 1;
				tradeInstrument = Convert.ToString(SystemPerformance.AllTrades[i].Entry.Instrument);
				tradeInstrument = tradeInstrument.Split()[0];
				tradeQuantity = SystemPerformance.AllTrades[i].Quantity;
				tradePosition = Convert.ToString(SystemPerformance.AllTrades[i].Entry.MarketPosition);
				tradeEntryTime = Convert.ToString(SystemPerformance.AllTrades[i].Entry.Time);
				tradeEntryPrice = SystemPerformance.AllTrades[i].Entry.Price;
				tradeExitTime = Convert.ToString(SystemPerformance.AllTrades[i].Exit.Time);
				tradeExitPrice = SystemPerformance.AllTrades[i].Exit.Price;
				tradeProfit = SystemPerformance.AllTrades[i].ProfitCurrency;
				tradeCommission = SystemPerformance.AllTrades[i].Commission;
				tradeMAE = SystemPerformance.AllTrades[i].MaeCurrency;
				tradeMFE = SystemPerformance.AllTrades[i].MfeCurrency;
				tradeBars = SystemPerformance.AllTrades[i].Entry.BarsInProgress;
				
				sw = File.AppendText(path);  // Open the path for writing
				sw.WriteLine(tradeNumber + ";" + tradeInstrument + ";" + tradeStrategy + ";" + version + ";" + tradeQuantity + ";" + tradePosition + ";" 
				+ tradeEntryTime + ";" + tradeEntryPrice + ";" + tradeExitTime + ";" + tradeExitPrice + ";"  
				+ tradeProfit + ";" + tradeCommission + ";" + tradeMAE + ";" + tradeMFE); // Append a new line to the file
				sw.Close(); // Close the file to allow future calls to access the file again.
			}
		}
		
		#endregion
		
	}
}

namespace E2tFund50MgcCombEnums
{
	public enum Strategies
	{
		No_exportar,
		Friday,
		FiBo,
		CuBoLong,
		CuBoShort,
		PdReLong,
		PdReShort,
		R3BoLong,
		R3BoShort,
		PbGLong,
		BBBoLong,
		GannBoLong,
		MondayShort
	};
	
}
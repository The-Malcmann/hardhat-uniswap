import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, constants, Contract, ContractFactory, Signer, utils} from "ethers";
import deployFactory from "./deployers/deployFactory";
import deployRouter from "./deployers/deployRouter";
import deployWETH9 from "./deployers/deployWETH9";
import Interface from "./Interface";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CommonDeployers } from "../common";
import { ExactInputOptions, MintOptions } from "../../types.d.ts";
import deployTokenDescriptor from "./deployers/deployTokenDescriptor";
import deployPositionManager from "./deployers/deployPositionManager";
import deployNFTDescriptorLibrary from "./deployers/deployNFTDescriptorLibrary";
import { parseEther, UnicodeNormalizationForm } from "ethers/lib/utils";
import {abi, bytecode} from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"
import { calculateSqrtPriceX96, getNearestUsableTick } from "../util/tokenUtil";




export class UniswapV3Deployer {
  MIN_TICK = 0
  MAX_TICK = 100000

  public Interface = Interface;
  public deployer?: SignerWithAddress;
  public hre?: HardhatRuntimeEnvironment;

  private _factory?: Contract;
  private _router?: Contract;
  private _weth?: Contract;
  private _poolInitializer?:Contract;
  private _positionManager?: Contract;
  private _tokenDescriptor?: Contract;
  private _nftDescriptorLibrary?: Contract;
  private _tokens: Map<string, Contract>;

  constructor(hre: HardhatRuntimeEnvironment, _deployer?: SignerWithAddress) {
    this.hre = hre;
    this.deployer = _deployer;
    this._tokens = new Map()
  }

  public async deploy(signer: SignerWithAddress) {
    const { factory, Factory } = await deployFactory(signer);
    const { weth9, WETH9 } = await deployWETH9(signer);
    const { router, Router } = await deployRouter(signer, factory, weth9);
    const {nftDescriptorLibrary, NFTDescriptorLibrary} = await deployNFTDescriptorLibrary(signer);
    const { tokenDescriptor, TokenDescriptor} = await deployTokenDescriptor(signer, nftDescriptorLibrary, weth9);
    const {positionManager, PositionManager} = await deployPositionManager(signer, factory, weth9, tokenDescriptor)
    this._factory = factory;
    this._router = router;
    this._weth = weth9;
    this._tokenDescriptor = tokenDescriptor;
    this._positionManager = positionManager;
    this._nftDescriptorLibrary = nftDescriptorLibrary;
    return {
      weth9,
      WETH9,
      factory,
      Factory,
      router,
      Router,
      tokenDescriptor,
      TokenDescriptor,
      nftDescriptorLibrary,
      NFTDescriptorLibrary,
      positionManager,
      PositionManager
    };

  }

  public async getWeth(signer: SignerWithAddress): Promise<Contract> {
    if (!this._weth) {
      const { weth9 } = await deployWETH9(signer)
      this._weth = weth9;
    }
    return this._weth;
  }

  public async getFactory(signer: SignerWithAddress): Promise<Contract> {
    if (!this._factory) {
      const { factory } = await deployFactory(signer)
      this._factory = factory;
    }
    return this._factory;
  }

  public async getRouter(signer: SignerWithAddress): Promise<Contract> {
    if (!this._router) {
      const { router } = await deployRouter(signer, await this.getFactory(signer), await this.getWeth(signer))
      this._router = router;
    }
    return this._router;
  }

  public async getTokenDescriptor(signer: SignerWithAddress): Promise<Contract> {
    if (!this._tokenDescriptor) {
      const { tokenDescriptor } = await deployTokenDescriptor(signer, await this.getNftDescriptorLibrary(signer), await this.getWeth(signer))
      this._tokenDescriptor = tokenDescriptor;
    }
    return this._tokenDescriptor;
  }
  public async getPositionManager(signer: SignerWithAddress): Promise<Contract> {
    if (!this._positionManager) {
      const { positionManager } = await deployPositionManager(signer, await this.getFactory(signer), await this.getWeth(signer), await this.getTokenDescriptor(signer))
      this._positionManager = positionManager;
    }
    return this._positionManager;
  }
  public async getNftDescriptorLibrary(signer: SignerWithAddress): Promise<Contract> {
    if (!this._nftDescriptorLibrary) {
      const { nftDescriptorLibrary } = await deployNFTDescriptorLibrary(signer)
      this._nftDescriptorLibrary = nftDescriptorLibrary;
    }
    return this._nftDescriptorLibrary;
  }

  public async createERC20(signer: SignerWithAddress, name: string, symbol: string): Promise<Contract> {
    const { erc20 } = await CommonDeployers.deployERC20(signer, name, symbol);
    this._tokens.set(erc20.address, erc20);
    return erc20;
  }

  public getERC20(address: string): Contract | undefined {
    return this._tokens.get(address);
  }

  public async exactInput(options: ExactInputOptions) {
    const router = await this.getRouter(options.signer)
    const amountInEther = options.amountIn;
    await router.exactInput(options.tokenIn, options.tokenOut, options.fee, (await options.signer.getAddress()), 9678825033, amountInEther, 1, 0 )
  }

  public async mintPosition(options: MintOptions ) {
    const positionManager = await this.getPositionManager(options.signer)
    const signerAddress =  await options.signer.getAddress()

    //Parse amounts into ether
    const amount0DesiredInEther = parseEther(options.amount0Desired.toString());
    const amount1DesiredInEther = parseEther(options.amount1Desired.toString());

    // Approve Tokens
    if(this._tokens.get(options.token0) == undefined) {
      return
    } else {
      //@ts-ignore
      await (this._tokens.get(options.token0)).connect(options.signer).approve(positionManager.address, this.hre.ethers.constants.MaxInt256);
      //@ts-ignore
      await (this._tokens.get(options.token1)).connect(options.signer).approve(positionManager.address, this.hre.ethers.constants.MaxInt256);
    }
    let token0, token1;
    try{

      // Sort tokens to avoid revert() from createAndInitializePoolIfNecessary in PoolInitializer
      if(options.token0 < options.token1) {
        token0 = options.token0;
        token1 = options.token1;
      } else {
        token0 = options.token1;
        token1 = options.token0;
      }
        // calculate squareRootPrice for desired price
        const sqrtPrice = calculateSqrtPriceX96(2, 18, 18)

        // create and initialize pool if necessary
        await positionManager.connect(options.signer).createAndInitializePoolIfNecessary(token0, token1, 3000, sqrtPrice.toFixed(0))

        const poolAddress =  await (await this.getFactory(options.signer)).getPool(token0, token1, 3000)
        const Pool = new ContractFactory(abi, bytecode);
        const pool = await Pool.attach(poolAddress);
        let slot0 = await pool.connect(options.signer).slot0();

        // get tick spacing info and nearest tick from Pool
        let tickSpacing = parseInt(await pool.connect(options.signer).tickSpacing())
        let nearestTick = getNearestUsableTick(parseInt(slot0.tick),tickSpacing)

        const mintParams = {
          token0: token0,
          token1: token1,
          fee: options.fee,
          tickLower: nearestTick - tickSpacing * 2,
          tickUpper: nearestTick + tickSpacing * 2,
          amount0Desired: amount0DesiredInEther.toString(),
          amount1Desired: amount1DesiredInEther.toString(),
          amount0Min: 0,
          amount1Min: 0,
          recipient: signerAddress,
          deadline: 9678825033
        }
        
        // Mint with desired amounts
        await positionManager.connect(options.signer).mint(mintParams)
    } catch(e) {
      console.log(e, "error for minting")
    }

    
  }
}

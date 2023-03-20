import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, constants, Contract, ContractFactory, Signer, utils } from "ethers";
import deployFactory from "./deployers/deployFactory";
import deployRouter from "./deployers/deployRouter";
import deployWETH9 from "./deployers/deployWETH9";
import Interface from "./Interface";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CommonDeployers } from "../common";
import { ExactInputOptions, MintOptions } from "../../types.d.ts";
import deployTokenDescriptor from "./deployers/deployTokenDescriptor";
import deployPositionManager from "./deployers/deployPositionManager";


export class UniswapV3Deployer {
  MIN_TICK = -887272
  MAX_TICK = -this.MIN_TICK

  public Interface = Interface;
  public deployer?: SignerWithAddress;
  public hre?: HardhatRuntimeEnvironment;

  private _factory?: Contract;
  private _router?: Contract;
  private _weth?: Contract;
  private _positionManager?: Contract;
  private _tokenDescriptor?: Contract;
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
    const { tokenDescriptor, TokenDescriptor} = await deployTokenDescriptor(signer, weth9);
    // const {positionManager, PositionManager} = await deployPositionManager(signer, factory, weth9, tokenDescriptor)
    return {
      weth9,
      WETH9,
      factory,
      Factory,
      router,
      Router,
      tokenDescriptor,
      TokenDescriptor,
      // positionManager,
      // PositionManager
    };
    this._factory = factory;
    this._router = router;
    this._weth = weth9;
    this._tokenDescriptor = tokenDescriptor;
    // this._positionManager = positionManager;
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
    const router = await this.getRouter(options.signer)
    const amount0DesiredInEther = options.amount0Desired;
    const amount1DesiredInEther = options.amount1Desired;
    
  }
}

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";

import deployFactory from "./deployers/deployFactory";
import deployRouter from "./deployers/deployRouter";
import deployWETH9 from "./deployers/deployWETH9";
import Interface from "./Interface";

import { CommonDeployers } from "../common";

export class UniswapV2Deployer {
  public Interface = Interface;
  private _factory?: Contract;
  private _router?: Contract;
  private _weth?: Contract;
  private _tokens: Map<string, Contract>;

  public deployer?: SignerWithAddress;

  constructor(_deployer?: SignerWithAddress) {
    this.deployer = _deployer;
    this._tokens = new Map()
  }

  public async deploy(signer: SignerWithAddress) {
    const { factory, Factory } = await deployFactory(signer, signer);
    const { weth9, WETH9 } = await deployWETH9(signer);
    const { router, Router } = await deployRouter(signer, factory, weth9);

    this._factory = factory;
    this._router = router;
    this._weth = weth9;

    return {
      weth9,
      WETH9,
      factory,
      Factory,
      router,
      Router,
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
      const { factory } = await deployFactory(signer, signer)
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

  public async createERC20(signer: SignerWithAddress, name: string, symbol: string): Promise<void> {
    const { erc20 } = await CommonDeployers.deployERC20(signer, name, symbol);
    this._tokens.set(erc20.address, erc20);
  }

  public getERC20(address: string): Contract | undefined {
    return this._tokens.get(address);
  }

  // public async addLiquidity(signer: SignerWithAddress, tokenA: )
}

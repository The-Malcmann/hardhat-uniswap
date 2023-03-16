import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, constants, Contract, ContractFactory, utils } from "ethers";
import { ethers } from "hardhat";

import deployFactory from "./deployers/deployFactory";
import deployRouter from "./deployers/deployRouter";
import deployWETH9 from "./deployers/deployWETH9";
import Interface from "./interfaces/Interface";
import { LiquidityOptions, SwapExactTokensForTokensOptions, LibraryOptions, DeployOptions } from "../../types.d.ts";

import { CommonDeployers } from "../common";

import {
  abi,
  bytecode,
} from "@uniswap/v2-core/build/UniswapV2Pair.json";

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

  /**
   * Returns the WETH contract
   * @param signer 
   * @returns 
   */
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

  public async getPair(signer: SignerWithAddress, tokenA: String, tokenB: String) {
    const factory = await this.getFactory(signer);
    const pairAddress = await factory.getPair(tokenA, tokenB);
    const pair = await ethers.getContractAt(
      require("@uniswap/v2-core/build/UniswapV2Pair.json")
        .abi,
      pairAddress

    );
    return pair;
  }

  public async createERC20(signer: SignerWithAddress, name: string, symbol: string): Promise<Contract> {
    const { erc20 } = await CommonDeployers.deployERC20(signer, name, symbol);
    this._tokens.set(erc20.address, erc20);
    return erc20;
  }

  public getERC20(address: string): Contract | undefined {
    return this._tokens.get(address);
  }

  public async addLiquidity(signer: SignerWithAddress, tokenA?: string, tokenB?: string, amountTokenA?: BigNumber, amountTokenB?: BigNumber) {
    const router = await this.getRouter(signer)
    await router.connect(signer).addLiquidity(tokenA, tokenB, amountTokenA, amountTokenB, 1, 1, (await signer.getAddress()), 9678825033);
  }

  public async addLiquidityETH(signer: SignerWithAddress, token?: string, amountToken?: BigNumber) {
    const router = await this.getRouter(signer)
    await router.addLiquidityETH(token, amountToken, 1, 1, (await signer.getAddress()), 9678825033);
  }

  public async swapExactTokensForTokens(options: SwapExactTokensForTokensOptions) {
    const router = await this.getRouter(options.signer)
    options.outputToken
    const path = [options.inputToken, options.outputToken]
      const amountInEther = ethers.utils.parseEther(options.amountIn.toString());
      await router.swapExactTokensForTokens(amountInEther, 1, path, (await options.signer.getAddress()), 9678825033)
  }

  // public async swapTokensForExactTokens(options: SwapOptions) {
  //   const router = await this.getRouter(options.signer)
  //   const path = [options.inputToken, options.outputToken]
  //     const amountOutEther = ethers.utils.parseEther(options.amountOut.toString());
  //     await router.swapTokensForExactTokens(amountOutEther, ethers.constants.MaxInt256, path, (await options.signer.getAddress()), 9678825033)
  // }

  public async removeLiquidity(signer: SignerWithAddress, tokenA: String, tokenB: String, amountLp: Number) {
    const router = await this.getRouter(signer)
    const liquidityEther = ethers.utils.parseEther(amountLp.toString())
    await router.removeLiquidity(tokenA, tokenB, liquidityEther, 1, 1, (await signer.getAddress()), 9678825033)
  }

  public async quote(signer: SignerWithAddress, tokenA: String, tokenB: String, amountA: Number) {
    const router = await this.getRouter(signer)
    const amountAEther = ethers.utils.parseEther(amountA.toString())
    const pair = await this.getPair(signer, tokenA, tokenB);
    let reserveA, reserveB, timestamp
    // Sort reserves with tokens
    if (tokenA == await pair.token0()) {
      [reserveA, reserveB, timestamp] = await pair.getReserves()
    } else {
      [reserveB, reserveA, timestamp] = await pair.getReserves()

    }
    const quoteAmount = await router.quote(amountAEther, reserveA, reserveB)
    return quoteAmount
  }

  public async getLiquidityValueInTermsOfTokenA(signer: SignerWithAddress, tokenA: String, tokenB: String, amountLiquidity: number): Promise<Number> {
    const router = await this.getRouter(signer)
    const pair = await this.getPair(signer, tokenA, tokenB);

    let reserveA, reserveB, timestamp
    // Sort reserves with tokens
    if (tokenA == await pair.token0()) {
      [reserveA, reserveB, timestamp] = await pair.getReserves()
    } else {
      [reserveB, reserveA, timestamp] = await pair.getReserves()
    }
    const tvl = reserveA * 2
    const singleLp = tvl * Number(ethers.utils.parseEther("1")) / (await pair.totalSupply())
    console.log("tvl", tvl)
    console.log("singleLp:", singleLp)
    return singleLp * amountLiquidity;

  }


  // Test ETH Token
  // Return Types,
  // Atomic Tests
  // Object param
  // 
}

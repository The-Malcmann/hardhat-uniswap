import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Signer } from "ethers";


export type DeployOptions = {
    tWETH: boolean;
    signer: SignerWithAddress;
}

export interface AddLiquidityOptions {
    signer: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountTokenA: number | BigNumber;
    amountTokenB: number | BigNumber;
}

export interface RemoveLiquidityOptions {
    signer: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountLiquidity: number | BigNumber;
}

export interface SwapExactTokensForTokensOptions {
    signer: SignerWithAddress;
    amountIn: number;
    inputToken: string;
    outputToken: string;
}

export interface SwapTokensForExactTokensOptions {
    signer: SignerWithAddress;
    amountOut: number;
    inputToken: string;
    outputToken: string;
}

export interface QuoteOptions {
    signer: SignerWithAddress;
    tokenA: String;
    tokenB: String;
    amountA: Number;
}

export interface GetLiquidityValueInTermsOfTokenAOptions {
    signer: SignerWithAddress;
    tokenA: String;
    tokenB: String;
    amountLiquidity: number;
}
export interface AddLiquidityETHOptions {
    signer: SignerWithAddress;
    token: string;
    amountToken: number;
    amountETH: number;
}
export interface RemoveLiquidityETHOptions {
    signer: SignerWithAddress;
    token: string;
    amountLiquidity: number;
}
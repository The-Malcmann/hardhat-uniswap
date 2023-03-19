import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";


export type DeployOptions = {
    tWETH: boolean;
    signer: SignerWithAddress;
}

export interface AddLiquidityOptions {
    signer: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountTokenA: number;
    amountTokenB: number;
}

export interface RemoveLiquidityOptions {
    signer: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountLiquidity: number;
}

export interface SwapExactTokensForTokensOptions {
    signer: SignerWithAddress;
    amountIn: number;
    inputToken: string;
    /**
     * @note Fuck u
     */
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
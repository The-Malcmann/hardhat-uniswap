import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

export type LiquidityOptions = AddLiquidityOptions | RemoveLiquidityOptions;
// export type SwapOptions = SwapExactTokensForTokensOptions & SwapTokensForExactTokensOptions;
// export type SwapOptions = {
//     signer: SignerWithAddress;
//     amountIn?: number;
//     amountOut?: number;
//     inputToken: string;
//     outputToken: string;
// }
export type LibraryOptions = QuoteOptions | GetLiquidityValueInTermsOfTokenA;

export type DeployOptions = {
    tWETH: boolean;
    signer: SignerWithAddress;
}

interface AddLiquidityOptions {
    method: 'addLiquidity';
    signer: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountTokenA: number;
    amountTokenB: number;
}

interface RemoveLiquidityOptions {
    method: 'removeLiquidity';
    signer: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountLp: number;
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

interface QuoteOptions {
    method: 'quote',
    signer: SignerWithAddress;
    tokenA: String;
    tokenB: String;
    amountA: Number;
}

interface GetLiquidityValueInTermsOfTokenA {
    method: 'getLiquidityValueInTermsOfTokenA',
    signer: SignerWithAddress;
    tokenA: String;
    tokenB: String;
    amountLiquidity: number;
}
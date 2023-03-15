import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import ERC20 from "@uniswap/v2-core/build/ERC20.json";
import IUniswapV2ERC20Build from "@uniswap/v2-core/build/IUniswapV2ERC20.json";
import IUniswapV2FactoryBuild from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2PairBuild from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import IUniswapV2Router02Build from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
// tslint:disable-next-line no-implicit-dependencies
import { assert, expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, constants, Contract, ContractFactory, utils } from "ethers";

import { UniswapV2Deployer } from "../src/v2/UniswapV2Deployer";

import { useEnvironment } from "./helpers";

function eth(n: number): BigNumber {
  return utils.parseEther(n.toString());
}

// describe("Integration Tests", function () {
//   useEnvironment("hardhat-project");

//   describe("Hardhat Runtime Environment extension", function () {
//     it("Should add extension UniswapV2Deployer", function () {
//       assert.instanceOf(this.hre.UniswapV2Deployer, UniswapV2Deployer);
//     });
//   });

//   describe("Swap", function () {
//     let token: Contract;
//     let weth9: Contract;
//     let signer: SignerWithAddress;
//     let factory: Contract;
//     let router: Contract;
//     let AMOUNT_TOKEN: BigNumber;
//     let AMOUNT_WETH9: BigNumber;
//     let IUniswapV2Pair: { abi: any };

//     beforeEach(async function () {
//       AMOUNT_WETH9 = eth(1000);
//       AMOUNT_TOKEN = eth(1000);

//       [signer] = await this.hre.ethers.getSigners();
//       const deployer = new UniswapV2Deployer();
//       const result = await deployer.deploy(signer);

//       IUniswapV2Pair = deployer.Interface.IUniswapV2Pair;
//       factory = result.factory;
//       router = result.router;
//       weth9 = result.weth9;

//       const Token = new ContractFactory(ERC20.abi, ERC20.bytecode, signer);
//       token = await Token.deploy(AMOUNT_TOKEN);
//       await token.deployed();

//       await weth9.approve(router.address, AMOUNT_WETH9);
//       await token.approve(router.address, AMOUNT_TOKEN);
//     });

//     it("Should add liquidity", async function () {
//       await router.addLiquidityETH(
//         token.address,
//         AMOUNT_TOKEN,
//         AMOUNT_TOKEN,
//         AMOUNT_WETH9,
//         signer.address,
//         constants.MaxInt256,
//         { value: AMOUNT_WETH9 }
//       );

//       const pairAddr = factory.getPair(token.address, weth9.address);
//       const pair = await this.hre.ethers.getContractAt(
//         IUniswapV2Pair.abi,
//         pairAddr,
//         signer
//       );
//       const { reserve0, reserve1 } = await pair.getReserves();
//       assert.isTrue(AMOUNT_TOKEN.eq(reserve0));
//       assert.isTrue(AMOUNT_WETH9.eq(reserve1));
//     });

//     it("Should swap", async function () {
//       await router.addLiquidityETH(
//         token.address,
//         AMOUNT_TOKEN,
//         AMOUNT_TOKEN,
//         AMOUNT_WETH9,
//         signer.address,
//         constants.MaxInt256,
//         { value: AMOUNT_WETH9 }
//       );

//       const beforeETH = await signer.getBalance();
//       const beforeERC = await token.balanceOf(signer.address);
//       const amount = eth(1);
//       await router.swapExactETHForTokens(
//         0,
//         [weth9.address, token.address],
//         signer.address,
//         constants.MaxInt256,
//         { value: amount }
//       );
//       const afterETH = await signer.getBalance();
//       const afterERC = await token.balanceOf(signer.address);

//       assert.isTrue(afterETH.lt(beforeETH.sub(amount)));
//       assert.isTrue(afterERC.gt(beforeERC));
//     });
//   });
// });

describe("Unit Tests", function () {
  let AMOUNT_TOKEN: BigNumber;
  let AMOUNT_WETH9: BigNumber;
  describe("UniswapV2Deployer", function () {
    beforeEach(async function () {
      AMOUNT_WETH9 = eth(1000);
      AMOUNT_TOKEN = eth(1000);
    });
    useEnvironment("hardhat-project");

    // describe("Deployment", function () {
    //   it("Should deploy WETH9", async function () {
    //     const [signer] = await this.hre.ethers.getSigners();
    //     const deployer = new UniswapV2Deployer();
    //     const { weth9 } = await deployer.deploy(signer);
    //     assert.equal(await weth9.name(), "Wrapped Ether");
    //   });

    //   it("Should deploy Factory", async function () {
    //     const [signer] = await this.hre.ethers.getSigners();
    //     const deployer = new UniswapV2Deployer();
    //     const { factory } = await deployer.deploy(signer);
    //     assert.equal(await factory.feeToSetter(), signer.address);
    //   });

    //   it("Should deploy Router", async function () {
    //     const [signer] = await this.hre.ethers.getSigners();
    //     const deployer = new UniswapV2Deployer();
    //     const { router, factory, weth9 } = await deployer.deploy(signer);
    //     assert.equal(await router.factory(), factory.address);
    //     assert.equal(await router.WETH(), weth9.address);
    //   });

    //   it("Should have Interface", async function () {
    //     const deployer = new UniswapV2Deployer();
    //     expect(deployer.Interface.IUniswapV2Pair.abi).to.eql(
    //       IUniswapV2PairBuild.abi
    //     );
    //     expect(deployer.Interface.IUniswapV2ERC20.abi).to.eql(
    //       IUniswapV2ERC20Build.abi
    //     );
    //     expect(deployer.Interface.IUniswapV2Factory.abi).to.eql(
    //       IUniswapV2FactoryBuild.abi
    //     );
    //     expect(deployer.Interface.IUniswapV2Router02.abi).to.eql(
    //       IUniswapV2Router02Build.abi
    //     );
    //   });
    // });
    describe("router functionality", function () {
      it("Should add liquidity", async function () {
        const [signer] = await this.hre.ethers.getSigners();
        const v2Deployer = new UniswapV2Deployer();
        await v2Deployer.deploy(signer);

        const test1 = await v2Deployer.createERC20(signer, "Test2", "TEST2")
        const test2 = await v2Deployer.createERC20(signer, "Test1", "TEST1")

        await test1.connect(signer).approve((await v2Deployer.getRouter(signer)).address, ethers.constants.MaxUint256)
        await test2.connect(signer).approve((await v2Deployer.getRouter(signer)).address, ethers.constants.MaxUint256)

        await v2Deployer.addLiquidity(signer, test1.address, test2.address, AMOUNT_TOKEN, AMOUNT_TOKEN )


        // await v2Deployer.addLiquidityETH(signer, test1.address, AMOUNT_TOKEN);
        const test1BalanceBeforeSwap = await test1.balanceOf(await signer.getAddress())
        await v2Deployer.swapTokensForExactTokens(signer, 10, test1.address, test2.address);
        const test1BalanceAfterSwap = await test1.balanceOf(await signer.getAddress())
        console.log("Balance Before Swap",ethers.utils.formatEther(test1BalanceBeforeSwap))
        console.log("Balance After Swap",ethers.utils.formatEther(test1BalanceAfterSwap))
        console.log("Calculation",(Number(ethers.utils.formatEther(test1BalanceAfterSwap)) + 10))


        const pair = await v2Deployer.getPair(signer, test1.address, test2.address);
        const pairBalance = Number(ethers.utils.formatEther(await pair.balanceOf(await signer.getAddress())))
        await pair.connect(signer).approve((await v2Deployer.getRouter(signer)).address, ethers.constants.MaxUint256)
        console.log("pairbalance", pairBalance)
        await v2Deployer.removeLiquidity(signer, test1.address, test2.address, 10)
        console.log(ethers.utils.formatEther(await v2Deployer.quote(signer, 20, test1.address, test2.address)))

        console.log("Value of 10 LP in terms of test1", await v2Deployer.getLPValueInTermsOfTokenA(signer, test1.address, test2.address, 5))


        // expect (Number(ethers.utils.formatEther(test1BalanceBeforeSwap))).to.be.eq((Number(ethers.utils.formatEther(test1BalanceAfterSwap)) + 10))

        
      })
    })
  });
});

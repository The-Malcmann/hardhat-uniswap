// tslint:disable-next-line no-implicit-dependencies
import { assert, expect } from "chai";
import { useEnvironment } from "./helpers";
import { UniswapV3Deployer } from "../src/v3/UniswapV3Deployer";
//@ts-ignore
import { ethers } from "hardhat";
import { MintOptions } from "../types.d.ts";

describe("Unit Tests V3", function () {
    let AMOUNT_TOKEN: number;
    let AMOUNT_WETH9: number;
    describe("UniswapV3Deployer", function () {
        beforeEach(async function () {
            AMOUNT_WETH9 = 1000;
            AMOUNT_TOKEN = 1000;
        });
        useEnvironment("hardhat-project");

        describe("Deployment", function () {
            it("Should deploy WETH9", async function () {
                const [signer] = await ethers.getSigners();
                const deployer = new UniswapV3Deployer(this.hre);
                const { weth9 } = await deployer.deploy(signer);
                assert.equal(await weth9.name(), "Wrapped Ether");
                const provider = await ethers.getDefaultProvider();

                const balance = await weth9.balanceOf(await signer.getAddress());
            });
            it("Should deploy Factory", async function () {
                const [signer] = await ethers.getSigners();
                const deployer = new UniswapV3Deployer(this.hre);
                const { factory } = await deployer.deploy(signer);
                assert.equal(await factory.owner(), signer.address);
            });

            it("Should deploy Router", async function () {
                const [signer] = await ethers.getSigners();
                const deployer = new UniswapV3Deployer(this.hre);
                const { router, factory, weth9 } = await deployer.deploy(signer);
                assert.equal(await router.factory(), factory.address);
                assert.equal(await router.WETH9(), weth9.address);
            });
            it("Should deploy NFT Position Manager", async function () {
                const [signer] = await ethers.getSigners();
                const deployer = new UniswapV3Deployer(this.hre);
                const { positionManager, factory, weth9 } = await deployer.deploy(signer);
                expect(await positionManager.WETH9()).to.eq(weth9.address)
            })
            it("Should deploy Nonfungible Token Position Descriptor", async function () {
                const [signer] = await ethers.getSigners();
                const deployer = new UniswapV3Deployer(this.hre);
                const { tokenDescriptor, factory, weth9 } = await deployer.deploy(signer);
                expect(await tokenDescriptor.WETH9()).to.eq(weth9.address)
            })
        })
        describe("Helper Functions", function () {
            it("should create an ERC20", async function () {
                const [signer] = await ethers.getSigners();
                const v3Deployer = new UniswapV3Deployer(this.hre);
                await v3Deployer.deploy(signer);
                const test1 = await v3Deployer.createERC20(signer, "Test1", "TEST1")
                expect(await test1.name()).to.eq("Test1")
            });
        });

        describe("Position Manager Utility", function () {
            it("Should mint new position", async function () {
                const [signer] = await ethers.getSigners();
                const v3Deployer = new UniswapV3Deployer(this.hre);
                await v3Deployer.deploy(signer);
                const test1 = await v3Deployer.createERC20(signer, "Test1", "TEST1")
                const test2 = await v3Deployer.createERC20(signer, "Test2", "TEST2")
                const mintOptions: MintOptions = {
                    signer: signer,
                    token0: test1.address,
                    token1: test2.address,
                    fee: 3000,
                    amount0Desired: 1000,
                    amount1Desired: 1000
                }
                await v3Deployer.mintPosition(mintOptions)
                await v3Deployer.mintPosition(mintOptions)

            })
        })
    })
    
})
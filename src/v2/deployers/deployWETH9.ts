import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { abi, bytecode } from "@uniswap/v2-periphery/build/WETH9.json";
import { ContractFactory, ethers } from "ethers";

async function deployWETH9(signer: SignerWithAddress) {
  const WETH9 = new ContractFactory(abi, bytecode, signer);
  const weth9 = await WETH9.deploy();
  await weth9.deployed();
  // await weth9.connect(signer).deposit({value: ethers.utils.parseEther("100")})
  return { weth9, WETH9 };
}

export default deployWETH9;

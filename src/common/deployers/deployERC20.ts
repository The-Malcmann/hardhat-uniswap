import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";
import { abi, bytecode } from '../../../deploy/contracts/TestToken.json';
import { ethers, deployments } from "hardhat";

async function deployERC20(
  signer: SignerWithAddress,
  name: string,
  symbol: string
) {
  const ERC20 = new ContractFactory(abi, bytecode, signer);
  const erc20 = await ERC20.deploy(name, symbol);
  await erc20.deployed();

  await erc20.connect(signer).mint((await signer.getAddress()), ethers.utils.parseEther("1000000"))

  // await deployments.fixture(["testtoken"])
  // const erc20  = await ethers.getContract("TestToken");
  return { erc20 };
}
export { deployERC20 }

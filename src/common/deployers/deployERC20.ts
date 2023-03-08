import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { Contract, ContractFactory } from "ethers";
import { abi, bytecode } from '@openzeppelin/contracts/build/contracts/ERC20.json';

async function deployERC20(
  signer: SignerWithAddress,
  name: string,
  symbol: string
) {
  const ERC20 = new ContractFactory(abi, bytecode, signer);
  const erc20 = await ERC20.deploy(name, symbol);
  await erc20.deployed();
  return { erc20 };
}
export { deployERC20 }

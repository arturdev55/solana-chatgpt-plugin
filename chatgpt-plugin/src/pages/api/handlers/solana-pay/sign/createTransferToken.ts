import { NextApiRequest } from "next";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { CONNECTION } from "../../../constants";
import { makeRespondToSolanaPayGet, makeRespondToSolanaPayPost } from ".";

async function createTransferToken(req: NextApiRequest) {
  const { mint, destination, amount } = req.query;
  const { account: sender } = req.body;

  const sourceToken = getAssociatedTokenAddressSync(
    new PublicKey(mint as string),
    new PublicKey(sender)
  );
  const destinationToken = getAssociatedTokenAddressSync(
    new PublicKey(mint as string),
    new PublicKey(destination as string)
  );

  const tx = new Transaction();
  tx.add(
    createTransferInstruction(
      sourceToken,
      destinationToken,
      sender,
      Number(amount as string)
    )
  );
  tx.feePayer = new PublicKey(sender);
  tx.recentBlockhash = (await CONNECTION.getLatestBlockhash()).blockhash;

  return {
    transaction: tx
      .serialize({ requireAllSignatures: false })
      .toString("base64"),
  };
}

export default makeRespondToSolanaPayGet(
  makeRespondToSolanaPayPost(createTransferToken)
);

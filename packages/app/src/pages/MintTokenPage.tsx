import { useState } from "react";
import toast from "react-hot-toast";
import { BiCoin } from "react-icons/bi";
import { useMutation } from "react-query";

import { Button } from "~/components/Button";
import { Card } from "~/components/Card";
import { Input } from "~/components/Input";
import { NumberInput } from "~/components/NumberInput";
import { MINT_AMOUNT, TOKEN_ID } from "~/config";
import { useTokenMethods } from "~/hooks/useTokensMethods";
import { parseUnits, toBigInt } from "~/lib/math";
import { sleep } from "~/lib/utils";

export default function MintTokenPage() {
  const [asset, setAsset] = useState(TOKEN_ID);
  const methods = useTokenMethods(TOKEN_ID);
  const [amount, setAmount] = useState<string>(`${MINT_AMOUNT}`);

  const mintMutation = useMutation(
    async () => {
      const mintAmount = toBigInt(parseUnits(amount));
      await methods.mint(mintAmount);
      await methods.transferTo(mintAmount, { variableOutputs: 1 });
      await sleep(1000);
    },
    {
      onSuccess: () => {
        // Navigate to assets page to show new cons
        // https://github.com/FuelLabs/swayswap-demo/issues/40
        toast.success(`Token minted successfully!`);
      },
    }
  );

  return (
    <Card>
      <Card.Title>
        <BiCoin className="text-primary-500" />
        Mint
      </Card.Title>
      <div className="mb-4">
        <div className="flex gap-4 items-center">
          {/* TODO: Add validation of contract id, querying from the the core */}
          {/* TODO: Add validation to match a valid address */}
          {/* https://github.com/FuelLabs/swayswap-demo/issues/41 */}
          <div>
            <label
              id="label-1"
              className="mx-1 mb-2 flex text-gray-300"
              htmlFor="contractId"
            >
              Paste token contractId
            </label>
            <Input
              aria-labelledby="label-1"
              id="contractId"
              value={asset}
              placeholder="Type contract id"
              onChange={setAsset}
            />
          </div>
          <div>
            <label
              id="label-2"
              className="mx-1 mb-2 flex text-gray-300"
              htmlFor="amount"
            >
              Amount to mint
            </label>
            <NumberInput
              aria-labelledby="label-2"
              id="amount"
              autoFocus
              className="px-2"
              value={amount}
              onChange={setAmount}
              isAllowed={(values) => (values.floatValue || 0) <= MINT_AMOUNT}
            />
          </div>
        </div>
      </div>
      <Button
        data-testid="submit"
        isFull
        size="lg"
        variant="primary"
        isDisabled={!amount || parseInt(amount, 2) <= 0}
        isLoading={mintMutation.isLoading}
        onPress={() => !mintMutation.isLoading && mintMutation.mutate()}
      >
        Mint
      </Button>
    </Card>
  );
}
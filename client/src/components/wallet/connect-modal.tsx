import { useConnect, Connector } from "@starknet-react/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

export default function ConnectModal() {
  const { connect, connectors } = useConnect();
  return (
    <div className="w-full flex justify-end">
      <Dialog>
        <DialogTrigger asChild>
          <button className="image-button">CONNECT WALLET</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>Connect Wallet</DialogHeader>
          <div className="flex flex-col gap-4 items-center connect-modal-dialog">
            {connectors.map((connector: Connector) => (
            <Button
                key={connector.id}
                onClick={() => {console.log(connector); connect({ connector });}}
                disabled={!connector.available()}
            >
                {connector.name === "Braavos" || connector.name === "Argent X" ? (
                    <>
                        <img src={connector.icon.light} className="h-10 w-10 mr-4" alt={connector.name} />
                        {connector.name}
                    </>
                ) : (
                    connector.name
                )}
            </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
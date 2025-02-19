import { useConnect, Connector } from "@starknet-react/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";

export default function ConnectModal() {
  const { connect, connectors } = useConnect();
  return (
    <div className="w-full flex justify-end">
      <Dialog>
        <DialogTrigger asChild>
          <div className="image-button connect-image-button">CONNECT WALLET</div>
        </DialogTrigger>
        <DialogContent className="connect-modal-dialog">
          <DialogHeader>CONNECT WALLET</DialogHeader>
          <div className="providers-grid">
            {connectors.map((connector: Connector) => (
            <button
                key={connector.id}
                onClick={() => {console.log(connector); connect({ connector });}}
                disabled={!connector.available()}
            >
                {connector.name === "Braavos" || connector.name === "Argent X" ? (
                    <>
                        <div className="wallet-button-container">
                          <img src={connector.icon as string} alt={connector.name} className="wallet-icon-image" />
                          {connector.name}
                        </div>
                    </>
                ) : (
                    connector.name
                )}
            </button>
            ))}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
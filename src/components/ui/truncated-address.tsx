
import { useEnsName } from "@/hooks/use-ens-name";
import { AddressCopyButton } from "./address-copy-button";


// Truncated Address Component
interface TruncatedAddressProps {
  address: string;
  className?: string;
}

export function TruncatedAddress({
  address,
  className = "",
}: TruncatedAddressProps) {
  // Use the new custom hook
  const { data: ensName } = useEnsName(address);
  if (!address) return null;
  
  const start = address.slice(0, 6);
  const end = address.slice(-4);
  
  
  return (
    <div className="flex items-center">
      {ensName ? (
        <span className={`md:hidden font-mono font-bold ${className}`}>
          {ensName}
        </span>
      ) : (
        <span className={` md:hidden font-mono ${className}`}>
          {start}...{end}
        </span>
      )}
      
      <span className={`hidden md:inline font-mono ${className}`}>
        {address}
      </span>
      
      <AddressCopyButton className="mx-1 px-1 outline-none" text={address} />
    </div>
  );
}

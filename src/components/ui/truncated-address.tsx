interface TruncatedAddressProps {
  address: string;
  className?: string;
}

export function TruncatedAddress({
  address,
  className = "",
}: TruncatedAddressProps) {
  if (!address) return null;

  const start = address.slice(0, 6);
  const end = address.slice(-4);

  return (
    <>
      <span className={`md:hidden font-mono ${className}`}>
        {start}...{end}
      </span>
      <span className={`hidden md:inline font-mono ${className}`}>
        {address}
      </span>
    </>
  );
}

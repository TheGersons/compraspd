// pages/Quotes/components/ScrollArea.tsx
export default function ScrollArea({
  children,
  orientation = "x",
  className = "",
}: {
  children: React.ReactNode;
  orientation?: "x" | "y" | "both";
  className?: string;
}) {
  const overflow =
    orientation === "x"
      ? "overflow-x-auto overflow-y-hidden"
      : orientation === "y"
      ? "overflow-y-auto overflow-x-hidden"
      : "overflow-auto";
  return <div className={`nice-scrollbar ${overflow} ${className}`}>{children}</div>;
}

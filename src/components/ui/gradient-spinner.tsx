import { cn } from "@/lib/utils";

type Props = {
  from?: `from-${string}-${number}`;
  to?: `to-${string}-${number}`;
  via?: `via-${string}-${number}`;
  innerCircleSize?: number;
  outerCirclePadding?: number;
};

export function GradientSpinner(options: Props) {
  const {
    from = "from-green-500",
    to = "to-blue-500",
    via = "",
    innerCircleSize = 24,
    outerCirclePadding = 4,
  } = options;

  return (
    <div
      className={cn(
        `p-${outerCirclePadding} bg-gradient-to-tr animate-spin rounded-full`,
        {
          [from]: !!from,
          [to]: !!to,
          [via]: !!via,
        }
      )}
    >
      <div
        className={cn(
          `w-${innerCircleSize} h-${innerCircleSize} rounded-full bg-white`
        )}
      ></div>
    </div>
  );
}

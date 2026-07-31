export const CHART_COLORS = {
  primary: "#0d9488",
  secondary: "#14b8a6",
  cta: "#f97316",
  success: "#059669",
  muted: "#5f8a86",
  soft: "#ccfbf1",
  text: "#134e4a",
  border: "#b8ddd8",
} as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#ffffff",
  border: `1px solid ${CHART_COLORS.border}`,
  borderRadius: 8,
  color: CHART_COLORS.text,
  fontSize: 12,
} as const;

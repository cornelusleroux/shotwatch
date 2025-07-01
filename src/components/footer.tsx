import type { ComponentChildren } from "preact";

const Footer = ({ children }: { children: ComponentChildren }) => {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {children}
    </div>
  );
};

export default Footer;

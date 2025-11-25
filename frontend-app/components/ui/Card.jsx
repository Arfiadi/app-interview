export default function Card({ children, className = "" }) {
  return (
    <div className={
      "bg-[#151515] border border-[#222] rounded-xl p-6 shadow-lg " + className
    }>
      {children}
    </div>
  );
}

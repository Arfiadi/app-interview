export default function Input({ className = "", ...props }) {
  return (
    <input
      className={
        "w-full px-4 py-2 bg-[#222] border border-[#333] rounded-lg text-white focus:border-blue-600 outline-none transition " +
        className
      }
      {...props}
    />
  );
}

import ProfileDropdown from "./ProfileDropdown";

const Header = ({ role }) => {
  return (
    <header className="h-12 bg-white border-b px-4 flex items-center justify-between">
      
      <h2 className="font-semibold text-gray-700">
        {role === "admin" && "Admin Panel"}
        {role === "cashier" && "Cashier Desk"}
        {role === "kitchen" && "Kitchen Display"}
      </h2>

      <ProfileDropdown role={role} />
    </header>
  );
};

export default Header;

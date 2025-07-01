const DropdownItem = ({
  icon,
  label,
  checked,
  onClick,
}: {
  icon: string;
  label: string;
  checked?: boolean;
  onClick: (e: Event) => void;
}) => (
  <li>
    <a onClick={onClick}>
      <input type="checkbox" checked={checked} />
      <span>
        <i className="material-icons left">{icon}</i>
        {label}
      </span>
    </a>
  </li>
);

export default DropdownItem;

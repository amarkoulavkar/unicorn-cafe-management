import { Navigate } from 'react-router-dom';

type Props = {
  children: JSX.Element;
  allowedRoles: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role || '')) return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;
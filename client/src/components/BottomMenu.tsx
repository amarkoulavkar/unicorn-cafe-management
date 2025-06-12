import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Grid } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  DollarOutlined,
  BranchesOutlined,
} from '@ant-design/icons';

const { useBreakpoint } = Grid;

const BottomMenu = () => {
  const role = localStorage.getItem('role');
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  const menuLabel = (icon: React.ReactNode, label: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
      <span style={{
        fontSize: 10,
        marginTop: 2,
        color: '#888',
        letterSpacing: 0.5,
        fontWeight: 500,
        textTransform: 'capitalize'
      }}>
        {label}
      </span>
    </div>
  );

  const items = [
    {
      key: '/dashboard',
      icon: menuLabel(<HomeOutlined style={{ fontSize: isMobile ? 18 : 20 }} />, 'dashboard'),
      label: '',
      onClick: () => navigate('/dashboard'),
    },
    ...(role === 'admin'
      ? [
          {
            key: '/add-branches',
            icon: menuLabel(<BranchesOutlined style={{ fontSize: isMobile ? 18 : 20 }} />, 'branches'),
            label: '',
            onClick: () => navigate('/add-branches'),
          },
        ]
      : []),
    ...(role === 'admin' || role === 'manager'
      ? [
          // {
          //   key: '/branch-list',
          //   icon: menuLabel(<AppstoreOutlined style={{ fontSize: isMobile ? 18 : 20 }} />, 'branch list'),
          //   label: '',
          //   onClick: () => navigate('/branch-list'),
          // },
          {
            key: '/manage-expense-revenue',
            icon: menuLabel(<DollarOutlined style={{ fontSize: isMobile ? 18 : 20 }} />, 'expenses'),
            label: '',
            onClick: () => navigate('/manage-expense-revenue'),
          },
        ]
      : []),
    {
      key: '/profile',
      icon: menuLabel(<UserOutlined style={{ fontSize: isMobile ? 18 : 20 }} />, 'profile'),
      label: '',
      onClick: () => navigate('/profile'),
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        minWidth: 0,
        zIndex: 1000,
        background: '#fff',
        borderTop: '1px solid #eee',
        boxShadow: '0 -1px 6px #0001',
        height: isMobile ? 56 : 60,
        minHeight: isMobile ? 56 : 60,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        style={{
           
          background: 'transparent',
          fontSize: isMobile ? 12 : 16,
         
        }}
        items={items}
      />
    </div>
  );
};

export default BottomMenu;
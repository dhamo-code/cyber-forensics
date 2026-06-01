import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from '../../store/slices/authSlice';

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getMe());
    }
  }, [isAuthenticated, user, dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
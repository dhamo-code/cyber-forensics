import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addAlert } from '../store/slices/alertsSlice';
import { toast } from 'react-toastify';

let socket = null;

export function useSocket() {
  const { accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!accessToken || initialized.current) return;

    socket = io(
      import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
      {
        auth: { token: accessToken },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      }
    );

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('new:alert', (alert) => {
      dispatch(addAlert(alert));
      toast.warn(`🚨 New Alert: ${alert.title}`, { autoClose: 5000 });
    });

    socket.on('critical:threat', (data) => {
      dispatch(addAlert({ ...data, severity: 'critical' }));
      toast.error(`🔴 CRITICAL THREAT: ${data.title}`, {
        autoClose: false,
      });
    });

    socket.on('notification', (notification) => {
      toast.info(notification.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err.message);
    });

    initialized.current = true;

    return () => {
      if (socket) {
        socket.disconnect();
        initialized.current = false;
        socket = null;
      }
    };
  }, [accessToken]);

  return { socket };
}
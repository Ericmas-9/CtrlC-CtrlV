import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';
import './StatusBar.css';

const StatusBar = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="status-bar">
      <div className="status-time">{time}</div>
      <div className="dynamic-island"></div>
      <div className="status-icons">
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryMedium size={16} />
      </div>
    </div>
  );
};

export default StatusBar;

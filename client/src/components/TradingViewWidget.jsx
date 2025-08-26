import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol }) {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = process.env.REACT_APP_TRADINGVIEW_WIDGET;    
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#0F0F0F',
      gridColor: 'rgba(242, 242, 242, 0.06)',
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_side_toolbar: true,
      details: true,
    });

    container.current.innerHTML = '';
    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{
        height: '900px',  
        width: '100%',
        marginBottom: '2rem',
      }}
    >
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}

export default memo(TradingViewWidget);

import React, { useState } from 'react';
import axios from 'axios';

export const Ai = () => {
  const [response, setResponse] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (actionType) => {
    setLoading(true);
    setResponse('');

    const data = { action: actionType };
    if (actionType === 'buy') data.budget = Number(budget);

    try {
      const result = await axios.post('/aisuggest', data);
      setResponse(result.data.answer || 'No response');
      console.log('AI Suggestion:', result.data.answer);
    } catch (err) {
      console.error('Request failed:', err);
      setResponse('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const disabledBuy = !budget || Number(budget) <= 0 || loading;

  return (
    <div className="text-white p-4">
      <h2 className="mb-4 text-xl font-bold">AI Stock Suggestions</h2>

      <div className="mb-4">
        <label className="block mb-1">Investment Amount (₹)</label>
        <input
          type="number"
          value={budget}
          min="0"
          onChange={(e) => setBudget(e.target.value)}
          className="text-black p-2 rounded w-full"
          placeholder="e.g. 50000"
        />
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <button
          onClick={() => handleRequest('buy')}
          className="bg-blue-500 px-4 py-2 rounded disabled:opacity-50"
          disabled={disabledBuy}
        >
          Best stocks to buy
        </button>
        <button
          onClick={() => handleRequest('sell')}
          className="bg-green-500 px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          What stocks to sell
        </button>
        <button
          onClick={() => handleRequest('sectors')}
          className="bg-purple-500 px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          Top 5 sectors to invest in
        </button>
      </div>

      {loading ? (
        <div className="mt-4 p-3 bg-gray-800 rounded animate-pulse">Loading...</div>
      ) : response && (
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <pre className="whitespace-pre-wrap">{response}</pre>
          <div className="text-red-600 text-sm mt-3">
            * These are AI-generated suggestions. Do your own research before making financial decisions.
          </div>
        </div>
      )}
    </div>
  );
};


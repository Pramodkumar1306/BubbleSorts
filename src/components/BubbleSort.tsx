import React, { useState, useEffect, useCallback } from 'react';
import { Play, RefreshCw, Pause, Check } from 'lucide-react';

interface ArrayBar {
  value: number;
  isComparing: boolean;
  isSorted: boolean;
}

const BubbleSort: React.FC = () => {
  const [array, setArray] = useState<ArrayBar[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [iterations, setIterations] = useState(0);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [isSortingComplete, setIsSortingComplete] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [inputError, setInputError] = useState('');

  const generateRandomArray = useCallback(() => {
    const newArray: ArrayBar[] = Array.from({ length: 10 }, () => ({
      value: Math.floor(Math.random() * 30) + 10, // Reduced max value to keep bubbles smaller
      isComparing: false,
      isSorted: false,
    }));
    setArray(newArray);
    setIsSorting(false);
    setIterations(0);
    setComparisons(0);
    setSwaps(0);
    setIsSortingComplete(false);
    setUserInput('');
    setInputError('');
  }, []);

  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  const handleUserInputSubmit = () => {
    try {
      // Parse the comma-separated input
      const values = userInput.split(',').map(val => {
        const num = parseInt(val.trim(), 10);
        if (isNaN(num)) {
          throw new Error(`"${val.trim()}" is not a valid number`);
        }
        if (num < 1 || num > 99) {
          throw new Error(`Numbers must be between 1 and 99`);
        }
        return num;
      });

      // Limit the array length
      if (values.length < 2) {
        setInputError('Please enter at least 2 numbers');
        return;
      }
      
      if (values.length > 15) {
        setInputError('Please enter no more than 15 numbers');
        return;
      }

      // Create the new array
      const newArray: ArrayBar[] = values.map(value => ({
        value,
        isComparing: false,
        isSorted: false,
      }));

      setArray(newArray);
      setIsSorting(false);
      setIterations(0);
      setComparisons(0);
      setSwaps(0);
      setIsSortingComplete(false);
      setInputError('');
    } catch (error) {
      if (error instanceof Error) {
        setInputError(error.message);
      } else {
        setInputError('Invalid input. Please enter comma-separated numbers.');
      }
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const bubbleSort = async () => {
    if (!isRunning) return;
    setIsSorting(true);
    setIsSortingComplete(false);
    const n = array.length;
    let localIterations = 0;
    let localComparisons = 0;
    let localSwaps = 0;
    
    let workingArray = [...array];
    
    for (let i = 0; i < n - 1; i++) {
      localIterations++;
      let swapped = false;
      
      for (let j = 0; j < n - i - 1; j++) {
        if (!isRunning) {
          setIsSorting(false);
          return;
        }

        localComparisons++;
        setComparisons(localComparisons);

        setArray(prev => {
          const newArray = [...prev];
          newArray[j].isComparing = true;
          newArray[j + 1].isComparing = true;
          return newArray;
        });

        await sleep(speed);

        if (workingArray[j].value > workingArray[j + 1].value) {
          localSwaps++;
          setSwaps(localSwaps);
          swapped = true;
          
          const temp = workingArray[j];
          workingArray[j] = workingArray[j + 1];
          workingArray[j + 1] = temp;
          
          setArray(prev => {
            const newArray = [...prev];
            newArray[j] = { ...workingArray[j], isComparing: true };
            newArray[j + 1] = { ...workingArray[j + 1], isComparing: true };
            return newArray;
          });

          await sleep(speed);
        }

        setArray(prev => {
          const newArray = [...prev];
          newArray[j].isComparing = false;
          newArray[j + 1].isComparing = false;
          return newArray;
        });
      }

      if (!swapped) {
        break;
      }

      setIterations(localIterations);

      setArray(prev => {
        const newArray = [...prev];
        for (let k = n - i - 1; k < n; k++) {
          newArray[k] = { ...workingArray[k], isSorted: true };
        }
        return newArray;
      });
    }

    setArray(workingArray.map(item => ({
      ...item,
      isSorted: true,
      isComparing: false
    })));

    setIsSorting(false);
    setIsRunning(false);
    setIsSortingComplete(true);
  };

  useEffect(() => {
    if (isRunning && !isSorting) {
      bubbleSort();
    }
  }, [isRunning, isSorting]);

  const toggleSort = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">
          Bubble Sort Visualization
        </h1>
        
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Enter Your Own Array</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter comma-separated numbers (e.g., 15, 8, 23, 42, 16)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSorting}
              />
              {inputError && (
                <p className="text-red-500 text-sm mt-1">{inputError}</p>
              )}
            </div>
            <button
              onClick={handleUserInputSubmit}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              disabled={isSorting || !userInput.trim()}
            >
              <Check className="w-5 h-5 mr-2" />
              Use Values
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter numbers between 1-99, separated by commas. Maximum 15 numbers.
          </p>
        </div>
        
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={toggleSort}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            disabled={isSorting && !isRunning}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </button>
          
          <button
            onClick={generateRandomArray}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={isSorting}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reset
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Speed:</label>
            <input
              type="range"
              min="100"
              max="1000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-32"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-3">
            <div className="relative h-80 bg-gray-50 rounded-lg p-4 mb-8">
              <div className="h-full flex items-center justify-center">
                <div className="flex gap-3 items-center">
                  {array.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`rounded-full transition-all duration-300 flex items-center justify-center text-white font-medium
                          ${item.isComparing ? 'bg-yellow-400 shadow-lg scale-110' : 
                            item.isSorted ? 'bg-green-500' : 'bg-indigo-500'}
                          shadow-md hover:scale-105 transform`}
                        style={{
                          width: `${Math.max(Math.min(item.value * 1.2, 70), 40)}px`,
                          height: `${Math.max(Math.min(item.value * 1.2, 70), 40)}px`
                        }}
                      >
                        {item.value}
                      </div>
                      <div className="mt-3 text-gray-600 font-medium text-sm">
                        {index}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-indigo-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Unsorted</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Comparing</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Sorted</span>
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Statistics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Iterations</p>
                <p className="text-2xl font-bold text-indigo-600">{iterations}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Comparisons</p>
                <p className="text-2xl font-bold text-indigo-600">{comparisons}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Swaps</p>
                <p className="text-2xl font-bold text-indigo-600">{swaps}</p>
              </div>
              {isSortingComplete && (
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <p className="text-green-700 font-medium">
                    Sorting Complete! 🎉
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BubbleSort;
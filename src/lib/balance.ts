// Central balance management system
export const getBalance = (): number => {
  const balance = localStorage.getItem('tonnect_balance');
  return balance ? parseFloat(balance) : 0;
};

export const addBalance = (amount: number): number => {
  const currentBalance = getBalance();
  const newBalance = currentBalance + amount;
  localStorage.setItem('tonnect_balance', newBalance.toString());
  return newBalance;
};

export const getTotalMined = (): number => {
  const savedState = localStorage.getItem('miningState');
  if (savedState) {
    const { totalMined } = JSON.parse(savedState);
    return totalMined || 0;
  }
  return 0;
};

export const getTotalSpinWon = (): number => {
  const total = localStorage.getItem('total_spin_won');
  return total ? parseFloat(total) : 0;
};

export const addSpinWin = (amount: number): number => {
  const current = getTotalSpinWon();
  const newTotal = current + amount;
  localStorage.setItem('total_spin_won', newTotal.toString());
  return newTotal;
};

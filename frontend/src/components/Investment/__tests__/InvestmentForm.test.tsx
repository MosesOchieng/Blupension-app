import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../../store';
import InvestmentForm from '../InvestmentForm';

describe('InvestmentForm', () => {
    it('validates minimum investment amount', async () => {
        render(
            <Provider store={store}>
                <InvestmentForm />
            </Provider>
        );

        const amountInput = screen.getByLabelText(/amount/i);
        fireEvent.change(amountInput, { target: { value: '500' } });

        const submitButton = screen.getByRole('button', { name: /invest/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/minimum investment is 1000/i)).toBeInTheDocument();
        });
    });

    it('submits form successfully', async () => {
        render(
            <Provider store={store}>
                <InvestmentForm />
            </Provider>
        );

        const amountInput = screen.getByLabelText(/amount/i);
        fireEvent.change(amountInput, { target: { value: '5000' } });

        const percentageInput = screen.getByLabelText(/stablecoin percentage/i);
        fireEvent.change(percentageInput, { target: { value: '60' } });

        const submitButton = screen.getByRole('button', { name: /invest/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/investment created successfully/i)).toBeInTheDocument();
        });
    });
}); 
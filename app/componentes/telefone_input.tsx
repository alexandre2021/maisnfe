import React from 'react';
import NumberFormat from 'react-number-format';
import TextField from '@mui/material/TextField';

interface PhoneNumberInputProps {
    value: string;
    onChange: (value: string) => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChange }) => {
    return (
        <NumberFormat
            value={value}
            onValueChange={(values) => onChange(values.value)}
            format="(##) #####-####"
            customInput={TextField}
            label="Telefone"
            variant="outlined"
            fullWidth
            margin="normal"
        />
    );
};

export default PhoneNumberInput;

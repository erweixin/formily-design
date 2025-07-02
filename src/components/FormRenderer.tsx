'use client';

import { FormProvider } from '@formily/react';
import { createForm } from '@formily/core';
import {
  FormItem,
  Input,
  Select,
  DatePicker,
  Switch,
  Radio,
  Checkbox,
  NumberPicker,
  Upload,
  Transfer,
  Cascader,
  TimePicker,
  TreeSelect,
  FormGrid,
  FormButtonGroup,
  FormCollapse,
  FormTab,
  FormLayout,
  FormStep,
} from '@formily/antd-v5';
import { createSchemaField } from '@formily/react';
import type { FormilySchema } from '@/types';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    DatePicker,
    Switch,
    Radio,
    RadioGroup: Radio.Group,
    Checkbox,
    CheckboxGroup: Checkbox.Group,
    NumberPicker,
    Upload,
    Transfer,
    Cascader,
    TimePicker,
    TreeSelect,
    FormGrid,
    FormButtonGroup,
    FormCollapse,
    FormTab,
    FormLayout,
    FormStep,
    TextArea: Input.TextArea,
  },
});

interface FormRendererProps {
  schema: FormilySchema;
}

export function FormRenderer({ schema }: FormRendererProps) {
  const form = createForm();

  return (
    <FormProvider form={form}>
      <div className="p-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <SchemaField schema={schema as any} />
      </div>
    </FormProvider>
  );
} 
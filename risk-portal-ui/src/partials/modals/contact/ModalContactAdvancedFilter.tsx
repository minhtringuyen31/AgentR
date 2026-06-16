import React, { FC, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { FilterEntry } from '@/types/Filters';
import { debounce } from '@mui/material';
import { useContactContext } from '@/layouts/contact';
import { IUser } from '@/types/User';
import { useUser } from '@/hooks';
import { Button, KeenIcon, Modal, ModalBody, ModalContent, ModalHeader } from '@/components';
import { Input, Select } from '@/components/forms';
import { SingleValue } from 'react-select';
import { mockUsers } from '@/mockups/user';
import { DatePicker } from 'antd';

interface ModalContactAdvancedFilterProps {
  isOpen: boolean;
  onClose: () => void;
  entries: FilterEntry[];
  onSetEntries: (entries: FilterEntry[]) => void;
  onApply: () => void;
  onAddEntry: () => void;
  onClearAll: () => void;
  onClearEntry: (index: number) => void;
  hideFilters?: string[];
}

type ISelectValue = SingleValue<{ value: string; label: string }> | null;

const filterFieldOptions = [
  {
    name: 'name',
    label: 'Full Name',
    allowedRules: ['contains', 'notContains', 'isEmpty', 'isNotEmpty']
  },
  {
    name: 'contact_lists',
    label: 'List',
    allowedRules: ['contains', 'notContains', 'isEmpty', 'isNotEmpty']
  },
  {
    name: 'email',
    label: 'Email',
    allowedRules: ['contains', 'notContains', 'isEmpty', 'isNotEmpty']
  },
  {
    name: 'phone',
    label: 'Phone Number',
    allowedRules: ['contains', 'notContains', 'isEmpty', 'isNotEmpty']
  },
  {
    name: 'company',
    label: 'Company Name',
    allowedRules: ['contains', 'notContains', 'isEmpty', 'isNotEmpty']
  },
  {
    name: 'job_title',
    label: 'Job Title',
    allowedRules: ['contains', 'notContains', 'isEmpty', 'isNotEmpty']
  },
  {
    name: 'user',
    label: 'Owner',
    allowedRules: ['eq', 'isEmpty', 'isNotEmpty']
  },
  {
    name: 'created_at',
    label: 'Created On',
    allowedRules: ['eq', 'lt', 'gt']
  },
  {
    name: 'last_user_contacted_at',
    label: 'Last Contact From You',
    allowedRules: ['eq', 'lt', 'gt', 'isEmpty', 'isNotEmpty']
  },
  {
    name: 'last_customer_contacted_at',
    label: 'Last Contact From Customer',
    allowedRules: ['eq', 'lt', 'gt', 'isEmpty', 'isNotEmpty']
  }
];

const ruleOptions = [
  {
    value: 'eq',
    label: 'Equals'
  },
  {
    value: 'contains',
    label: 'Contains'
  },
  {
    value: 'notContains',
    label: 'Does not contain'
  },
  {
    value: 'lt',
    label: 'Is before'
  },
  {
    value: 'gt',
    label: 'Is after'
  },
  {
    value: 'isEmpty',
    label: 'Is empty'
  },
  {
    value: 'isNotEmpty',
    label: 'Is not empty'
  }
];

const ModalContactAdvancedFilter: FC<ModalContactAdvancedFilterProps> = ({
  isOpen,
  onClose,
  entries,
  onSetEntries,
  onApply,
  onAddEntry,
  onClearAll,
  onClearEntry,
  hideFilters
}) => {
  const [searchUserKeyword, setSearchUserKeyword] = useState<string>('');
  const { usersData } = useUser(1, 10, '', searchUserKeyword);
  // TODO: INTEGRATE
  const users = useMemo(() => usersData?.results || [], [usersData]);

  const updateEntries = (index: number, newEntries: FilterEntry) => {
    const newEntriesList = [...entries];
    newEntriesList[index] = newEntries;
    onSetEntries(newEntriesList);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader title="Advanced Filters" className="p-0 border-0">
          <button onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2 justify-start items-start">
            {entries.map((entry, index) => (
              <FilterEntryRow
                key={index}
                entry={entry}
                users={users}
                onSearchUserKeywordChange={(value) => setSearchUserKeyword(value)}
                index={index}
                onUpdateEntry={updateEntries}
                onClearEntry={onClearEntry}
                unavailableFields={
                  // entries.map((e) => e.field)
                  // .concat(hideFilters || [])
                  hideFilters ?? []
                }
              />
            ))}
            <button className="mt-4 text-sm text-primary" onClick={onAddEntry}>
              <KeenIcon icon="plus" /> <span>Add Condition</span>
            </button>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button color="secondary" className="border-2 px-6" onClick={onClearAll}>
              Clear All
            </Button>
            <Button className="px-6" onClick={onApply}>
              Apply
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

interface FilterEntryProps {
  entry: FilterEntry;
  users: IUser[];
  index: number;
  unavailableFields: string[];
  onSearchUserKeywordChange: (value: string) => void;
  onClearEntry: (index: number) => void;
  onUpdateEntry: (index: number, entry: FilterEntry) => void;
}

const FilterEntryRow: FC<FilterEntryProps> = ({
  entry,
  users,
  index,
  unavailableFields,
  onSearchUserKeywordChange,
  onClearEntry,
  onUpdateEntry
}) => {
  const { contactListsData } = useContactContext();
  const [textValue, setTextValue] = useState<string>(
    typeof entry.value === 'string' ? entry.value : ''
  );
  const contactLists = useMemo(() => contactListsData?.results || [], [contactListsData]);
  const _unavailableFields = useMemo(
    () => unavailableFields.filter((field) => field !== entry.field),
    [unavailableFields, entry.field]
  );

  const availableFields = useMemo(
    () => filterFieldOptions.filter((field) => !_unavailableFields.includes(field.name)),
    [_unavailableFields]
  );

  const availableRules = useMemo(
    () => filterFieldOptions.find((field) => field.name === entry.field)?.allowedRules || [],
    [entry.field]
  );

  const rules = useMemo(
    () => ruleOptions.filter((rule) => availableRules.includes(rule.value)),
    [availableRules]
  );

  const changeField = (value: string) => {
    if (!value) return;
    setTextValue('');
    onUpdateEntry(index, {
      field: value,
      rule: '',
      value: ''
    });
  };

  const changeRule = (value: string) => {
    if (!value) return;
    setTextValue('');
    onUpdateEntry(index, {
      field: entry.field,
      rule: value,
      value: ''
    });
  };

  const updateValue = debounce((value: string | string[]) => {
    onUpdateEntry(index, {
      field: entry.field,
      rule: entry.rule,
      value
    });
  }, 100);

  const searchUser = debounce((value: string) => {
    onSearchUserKeywordChange(value);
  }, 500);

  const handleUpdateTextValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value);
    updateValue(e.target.value);
  };

  const renderValueField = () => {
    let component = null;
    let selectedValue = null;
    let renderedSelectValue: {
      value: string;
      label: string;
    } | null;
    if (entry.rule === 'isEmpty' || entry.rule === 'isNotEmpty') {
      return null;
    }
    switch (entry.field) {
      case 'user':
        component = (
          <Select
            id="value"
            className="w-full"
            value={entry.value}
            options={users.map((user) => ({
              value: user.id,
              label: user.firstName + ' ' + user.lastName
            }))}
            onChange={(value) => updateValue(value)}
            onSearch={searchUser}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            disabled={!entry.rule}
          />
        );
        break;
      case 'contact_lists':
        component = (
          <Select
            id="contact_lists"
            mode="multiple"
            className="w-full"
            value={Array.isArray(entry.value) ? entry.value : []}
            placeholder="Select Lists"
            filterOption={(input, option) =>
              !!option?.label.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(e: string[]) => updateValue(Array.from(e.values()))}
            options={contactLists.map((list) => ({
              value: list.id,
              label: list.name
            }))}
            disabled={!entry.rule}
          />
        );
        break;
      case 'created_at':
      case 'last_customer_contacted_at':
      case 'last_user_contacted_at':
        component = (
          <DatePicker
            id="value"
            format={'MMM DD YYYY'}
            value={entry.value ? dayjs(entry.value as string) : undefined}
            onChange={(date) => updateValue(date ? date.format('YYYY-MM-DD') : '')}
            size="large"
            className="block mt-1"
            disabled={!entry.rule}
          />
        );
        break;
      default:
        component = (
          <Input
            id="value"
            className="block mt-1"
            value={textValue}
            disabled={!entry.rule}
            onChange={handleUpdateTextValue}
          />
        );
    }

    return (
      <>
        <label htmlFor="value" className="block text-2sm font-medium text-gray-700 uppercase">
          Value
        </label>
        {component}
      </>
    );
  };

  return (
    <div className="w-full grid grid-cols-7 items-center gap-4">
      <div className="col-span-2">
        <label htmlFor="contactProp" className="block text-2sm font-medium text-gray-700 uppercase">
          Contact Property
        </label>
        <Select
          id="contactProp"
          className="w-full"
          value={entry.field}
          options={availableFields.map((field) => ({
            value: field.name,
            label: field.label
          }))}
          onChange={changeField}
        />
      </div>
      <div className="col-span-2">
        <label htmlFor="rule" className="block text-2sm font-medium text-gray-700 uppercase">
          Rule
        </label>
        <Select
          id="rule"
          className="w-full"
          value={entry.rule}
          disabled={!entry.field}
          options={rules}
          onChange={changeRule}
        />
      </div>
      <div className="col-span-2">{renderValueField()}</div>
      <div className="col-span-1 flex items-center justify-center mt-4">
        <button className="hover:text-danger" onClick={() => onClearEntry(index)}>
          <KeenIcon icon="trash" />
        </button>
      </div>
    </div>
  );
};

export { ModalContactAdvancedFilter, FilterEntryRow };

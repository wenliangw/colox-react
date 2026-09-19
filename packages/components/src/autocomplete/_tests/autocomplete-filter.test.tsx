import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../../input';
import { AutoComplete } from '../autocomplete';

const Projects = (
  <AutoComplete.Suggestions>
    <AutoComplete.Option value="aa-01" text="Alpha project" />
    <AutoComplete.Option value="bb-02" text="Beta lab" />
    <AutoComplete.Option value="cc-03" text="Gamma site" disabled />
  </AutoComplete.Suggestions>
);

const renderProjects = (props: object = {}) =>
  render(
    <AutoComplete {...props}>
      <AutoComplete.Target>
        <Input />
      </AutoComplete.Target>
      {Projects}
    </AutoComplete>,
  );

const control = () => screen.getByRole('combobox') as HTMLInputElement;

const optionTexts = () => screen.getAllByRole('option').map((row) => row.textContent);

describe('autocomplete filter', () => {
  it('shows every row while the query is empty', () => {
    renderProjects();
    fireEvent.focus(control());
    expect(optionTexts()).toEqual(['Alpha project', 'Beta lab', 'Gamma site']);
  });

  it('matches the text case-insensitively', () => {
    renderProjects();
    fireEvent.focus(control());
    fireEvent.change(control(), { target: { value: 'ALPHA' } });
    expect(optionTexts()).toEqual(['Alpha project']);
  });

  it('matches the value too (value completion is the point)', () => {
    renderProjects();
    fireEvent.focus(control());
    fireEvent.change(control(), { target: { value: 'bb' } });
    expect(optionTexts()).toEqual(['Beta lab']);
  });

  it('trims the query before matching', () => {
    renderProjects();
    fireEvent.focus(control());
    fireEvent.change(control(), { target: { value: '  beta  ' } });
    expect(optionTexts()).toEqual(['Beta lab']);
  });

  it('honours the filterOption override', () => {
    renderProjects({
      filterOption: (query: string, option: { text: string }) => option.text.startsWith(query),
    });
    fireEvent.focus(control());
    fireEvent.change(control(), { target: { value: 'Be' } });
    expect(optionTexts()).toEqual(['Beta lab']);
    fireEvent.change(control(), { target: { value: 'eta' } });
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('keeps disabled rows visible inside the filtered result', () => {
    // 'a' hits all three (Alpha, Beta lab, Gamma) — the disabled row
    // stays in the list with its state intact.
    renderProjects();
    fireEvent.focus(control());
    fireEvent.change(control(), { target: { value: 'a' } });
    const rows = screen.getAllByRole('option');
    expect(rows).toHaveLength(3);
    const gamma = rows.find((row) => row.textContent === 'Gamma site');
    expect(gamma).toHaveClass('colox-autocomplete__option--disabled');
    expect(gamma).toHaveAttribute('aria-disabled', 'true');
  });
});

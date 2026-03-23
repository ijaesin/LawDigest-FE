import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchBar } from '@/app/common/components/molecules/SearchBar';

describe('SearchBar', () => {
  it('renders placeholder', () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="검색어를 입력하세요" />);
    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
  });

  it('calls onSearch on submit via Enter key', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);
    const input = screen.getByPlaceholderText('법안, 의원, 정당 검색...');
    await user.type(input, '교육기본법{Enter}');
    expect(handleSearch).toHaveBeenCalledWith('교육기본법');
  });

  it('does not call onSearch for empty input', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);
    const input = screen.getByPlaceholderText('법안, 의원, 정당 검색...');
    await user.type(input, '{Enter}');
    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('renders search icon', () => {
    const { container } = render(<SearchBar onSearch={vi.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

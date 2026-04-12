import { http, HttpResponse } from 'msw';

export const congressmanHandlers = [
  http.get('*/congressman/detail', ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('congressman_id');
    return HttpResponse.json({
      status: 200,
      code: 'SUCCESS',
      message: '',
      data: {
        congressman_id: id ?? '1',
        congressman_name: '홍길동',
        party_id: 1,
        party_name: '테스트당',
        party_image_url: '/images/test.png',
        elect_sort: '지역구',
        district: '서울 강남구',
        commits: '22대',
        elected: '초선',
        homepage: 'https://example.com',
        represent_count: 5,
        public_count: 10,
        congressman_image_url: '/images/congressman.png',
        like_checked: false,
        office: '의원회관 101호',
        email: 'test@assembly.go.kr',
        age: 50,
        gender: '남',
        follow_count: 100,
        brief_history: '서울대학교 졸업',
        telephone: '02-1234-5678',
      },
    });
  }),

  http.patch('*/congressman/user/like', () => {
    return HttpResponse.json({
      status: 200,
      code: 'SUCCESS',
      message: '',
      data: { congressman_id: '1', like_checked: true },
    });
  }),

  http.get('*/congressman/bill_info', () => {
    return HttpResponse.json({
      status: 200,
      code: 'SUCCESS',
      message: '',
      data: {
        bill_list: [],
        pagination_response: { page_number: 0, last_page: true },
      },
    });
  }),
];

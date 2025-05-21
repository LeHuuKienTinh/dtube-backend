const axios = require('axios');
const db = require('../config/db');
const BASE_URL = process.env.BASE_URL;
const KINOCHECK_API = process.env.KINOCHECK_API;
const KINOCHECK_API_KEY = process.env.KINOCHECK_API_KEY;

// Lấy danh sách phim mới cập nhật
const getLatestMovies = async (req, res) => {
  try {
    const { page } = req.params;
    // Thêm tham số limit=24 vào URL truy vấn
    const response = await axios.get(`${BASE_URL}/danh-sach/phim-moi-cap-nhat-v2?page=${page}`);

    const formattedItems = response.data.items.map((movie) => ({
      id: movie._id,
      poster: movie.poster_url,
      thumb: movie.thumb_url,
      name: movie.name,
      slug: movie.slug,
      status: movie.status,
      current: movie.episode_current,
      year: movie.year,
      origin_name: movie.origin_name
    }));

    res.json({ items: formattedItems });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách phim' });
  }
};


const getMovieDetails = async (req, res) => {
  try {
    const { slug } = req.params;

    // Kiểm tra phim có bị cấm không
    const [bannedMovies] = await db.execute('SELECT * FROM `banned_movies` WHERE `slug` = ?', [slug]);

    if (bannedMovies.length > 0) {
      // Nếu phim bị cấm, trả về thông tin phim bị cấm
      const bannedMovie = bannedMovies[0];
      return res.status(403).json({
        message: 'Phim bị cấm',
        description: bannedMovie.description,
      });
    }

    // Nếu không bị cấm, gọi API lấy thông tin phim
    const response = await axios.get(`${BASE_URL}/phim/${slug}`);
    if (!response.data) {
      return res.status(404).json({ error: 'Không tìm thấy phim' });
    }

    res.json(response.data);

  } catch (error) {
    console.error(error); // In ra lỗi để kiểm tra chi tiết
    res.status(500).json({ error: 'Lỗi khi lấy thông tin phim' });
  }
};


const getAllCategories = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/the-loai`);

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const categories = response.data.map((cat) => ({
        name: cat.name,
        slug: cat.slug
      }));

      res.json({ categories });
    } else {
      res.status(404).json({ error: 'Không có thể loại phim nào' });
    }
  } catch (error) {
    console.error('Lỗi khi lấy thể loại:', error.message);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách thể loại' });
  }
};
const getMoviesByCountry = async (req, res) => {
  const { slug } = req.params;
  const page = req.query.page || 1;

  try {
    const response = await axios.get(`https://phimapi.com/v1/api/quoc-gia/${slug}?page=${page}&limit=12`);
    res.json(response.data);
  } catch (error) {
    console.error('Lỗi khi gọi API phimapi:', error.message);
    res.status(500).json({ error: 'Không thể lấy dữ liệu từ phimapi.com' });
  }
};

const getMoviesByType = async (req, res) => {
  const { type, page } = req.params;

  try {
    const response = await axios.get(`https://phimapi.com/v1/api/danh-sach/${type}?page=${page}&limit=12`);
    res.json(response.data);
  } catch (error) {
    console.error('Lỗi khi gọi API phimapi:', error.message);
    res.status(500).json({ error: 'Không thể lấy dữ liệu từ phimapi.com' });
  }
};

const getAllCountry = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/quoc-gia`);

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const countries = response.data.map((cat) => ({
        name: cat.name,
        slug: cat.slug
      }));

      res.json({ countries });
    } else {
      res.status(404).json({ error: 'Không có quốc gia nào' });
    }
  } catch (error) {
    console.error('Lỗi khi lấy quốc gia:', error.message);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách quốc gia' });
  }
};

const getMoviesByCategory = async (req, res) => {
  try {
    const { type, page } = req.params;

    const response = await axios.get(`${BASE_URL}/v1/api/the-loai/${type}`, {
      params: {
        page,
        sort_field: null,
        sort_type: null,
        sort_lang: null,
        country: null,
        year: null,
        limit: 24
      }
    });

    const cdn = response.data.data.APP_DOMAIN_CDN_IMAGE;

    const formattedItems = response.data.data.items.map((movie) => ({
      id: movie._id,
      poster: `${cdn}/${movie.poster_url}`,
      thumb: `${cdn}/${movie.thumb_url}`,
      name: movie.name,
      slug: movie.slug,
    }));

    const titleType = response.data.data.seoOnPage.titleHead
    const totalPage = response.data.data.params.pagination.totalPages
    // const totalPage = response.data.params.pagination.totalPages
    res.json({ items: formattedItems, title: titleType, totalPage: totalPage });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: `Lỗi khi lấy danh sách thể loại ${req.params.type}` });
  }
};
// Lấy trailer phim
const getMovieTrailer = async (req, res) => {
  try {
    const { slug } = req.params;
    const phimRes = await axios.get(`${BASE_URL}/phim/${slug}`);
    const movie = phimRes.data?.movie;

    if (movie && movie.trailer_url) {
      return res.json({ trailer: movie.trailer_url });
    }

    const movieName = movie?.name || slug;
    const kinoRes = await axios.get(`${KINOCHECK_API}?query=${encodeURIComponent(movieName)}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': KINOCHECK_API_KEY,
        'X-Api-Host': 'api.kinocheck.com'
      }
    });

    const trailer = kinoRes.data?.trailers?.find(tr => tr.trailer && tr.trailer.url);
    if (trailer) {
      return res.json({ trailer: trailer.trailer.url });
    }

    res.status(404).json({ error: 'Không tìm thấy trailer' });
  } catch (error) {
    console.error('Lỗi trailer:', error.message);
    res.status(500).json({ error: 'Lỗi khi lấy trailer phim' });
  }
};


const searchMovies = async (req, res) => {
  try {
    const {
      keyword = '',
      category = '',
      country = '',
      year = '',
      sort_field = 'modified.time',
      sort_type = 'desc',
      sort_lang = '',
      page = req.params,
      limit = 12
    } = req.query;

    if (!keyword.trim()) {
      return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });
    }

    // Build query params cho phimapi.com
    const params = new URLSearchParams({ keyword, page, limit });
    if (category) params.append('category', category);
    if (country) params.append('country', country);
    if (year) params.append('year', year);
    if (sort_field) params.append('sort_field', sort_field);
    if (sort_type) params.append('sort_type', sort_type);
    if (sort_lang) params.append('sort_lang', sort_lang);

    const apiURL = `https://phimapi.com/v1/api/tim-kiem?${params.toString()}`;
    console.log('Calling external API:', apiURL);

    const externalRes = await axios.get(apiURL);
    const extData = externalRes.data.data;

    const items = extData.items || [];
    const totalPages = extData.params.pagination.totalPages;
    return res.json({
      items,
      currentPage: parseInt(page),
      totalPages,
      domainFrontend: extData.APP_DOMAIN_FRONTEND,
      domainCdnImage: extData.APP_DOMAIN_CDN_IMAGE
    });
  } catch (error) {
    console.error('Lỗi tìm kiếm:', error.message);
    return res.status(500).json({ error: 'Lỗi khi tìm kiếm phim' });
  }
};


module.exports = {
  getLatestMovies,
  getMovieDetails,
  getMoviesByCategory,
  getMovieTrailer,
  searchMovies,
  getAllCategories,
  getAllCountry,
  getMoviesByCategory,
  getMoviesByType,
  getMoviesByCountry, // <-- Thêm dòng này
};

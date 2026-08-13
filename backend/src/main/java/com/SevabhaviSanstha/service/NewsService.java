package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.entity.News;
import java.util.List;

public interface NewsService {
    News saveNews(News news);
    List<News> getAllNews();
    void deleteNews(Integer id);
}

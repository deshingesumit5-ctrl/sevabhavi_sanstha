package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.entity.News;
import com.SevabhaviSanstha.repository.NewsRepository;
import com.SevabhaviSanstha.service.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NewsServiceImpl implements NewsService {

    @Autowired
    private NewsRepository newsRepository;

    @Override
    public News saveNews(News news) {
        return newsRepository.save(news);
    }

    @Override
    public List<News> getAllNews() {
        return newsRepository.findAll();
    }

    @Override
    public void deleteNews(Integer id) {
        newsRepository.deleteById(id);
    }
}

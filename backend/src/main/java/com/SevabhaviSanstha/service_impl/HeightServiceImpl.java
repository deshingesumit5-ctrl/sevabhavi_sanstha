package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.entity.Height;
import com.SevabhaviSanstha.repository.HeightRepository;
import com.SevabhaviSanstha.service.HeightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HeightServiceImpl implements HeightService {

    @Autowired
    private HeightRepository heightRepository;

    @Override
    public List<Height> getAllHeights() {
        return heightRepository.findAll();
    }
}
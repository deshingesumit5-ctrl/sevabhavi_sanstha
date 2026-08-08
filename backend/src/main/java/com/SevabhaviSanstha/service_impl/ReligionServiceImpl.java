package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.entity.Religion;
import com.SevabhaviSanstha.repository.ReligionRepository;
import com.SevabhaviSanstha.service.ReligionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReligionServiceImpl implements ReligionService {

    @Autowired
    private ReligionRepository religionRepository;

    @Override
    public List<Religion> getAllReligions() {
        return religionRepository.findAll();
    }
}
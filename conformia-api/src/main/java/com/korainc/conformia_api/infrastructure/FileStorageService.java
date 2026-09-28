package com.korainc.conformia_api.infrastructure;

import com.korainc.conformia_api.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final Path root;

    public FileStorageService(@Value("${storage.location}") String location) {
        this.root = Paths.get(location).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(root);
            log.info("Diretório de armazenamento de arquivos: {}", root);
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível criar o diretório de armazenamento: " + root, e);
        }
    }

    public String store(MultipartFile file, String subdir) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Arquivo vazio ou ausente.");
        }

        String original = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "arquivo" : file.getOriginalFilename());
        String extensao = "";
        int ponto = original.lastIndexOf('.');
        if (ponto >= 0) {
            extensao = original.substring(ponto).toLowerCase();
        }
        String nomeArmazenado = UUID.randomUUID() + extensao;

        Path dir = root.resolve(subdir).normalize();
        if (!dir.startsWith(root)) {
            throw new BusinessException("Subdiretório inválido.");
        }

        try {
            Files.createDirectories(dir);
            Path destino = dir.resolve(nomeArmazenado).normalize();
            if (!destino.startsWith(root)) {
                throw new BusinessException("Caminho de destino inválido.");
            }
            try (var in = file.getInputStream()) {
                Files.copy(in, destino, StandardCopyOption.REPLACE_EXISTING);
            }
            // Mantém o caminho persistido independente do sistema operacional.
            return root.relativize(destino).toString().replace('\\', '/');
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao gravar o arquivo no disco.", e);
        }
    }

    public Resource load(String caminhoRelativo) {
        Path file = root.resolve(caminhoRelativo).normalize();
        if (!file.startsWith(root)) {
            throw new BusinessException("Caminho de arquivo inválido.");
        }
        try {
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new BusinessException("Arquivo não encontrado no armazenamento.");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new IllegalStateException("Caminho de arquivo malformado: " + caminhoRelativo, e);
        }
    }

    public void delete(String caminhoRelativo) {
        try {
            Path file = root.resolve(caminhoRelativo).normalize();
            if (file.startsWith(root)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException e) {
            log.warn("Não foi possível remover o arquivo {}: {}", caminhoRelativo, e.getMessage());
        }
    }
}

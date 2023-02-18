IUPLOADER_PORT := 50000
IUPLOADER_ADMIN_PASSWORD := password

-include run.conf

setup:
	echo "IUPLOADER_PORT = 50400" > run.conf
	echo "IUPLOADER_ADMIN_PASSWORD = password" >> run.conf

run:
	@$(call docker-compose,up)

define docker-compose
	IUPLOADER_PORT=$(IUPLOADER_PORT) \
	IUPLOADER_ADMIN_PASSWORD=$(IUPLOADER_ADMIN_PASSWORD) \
		docker-compose $1 $(IUPLOADER_OPTS)
endef

.PHONY: setup run

#!/bin/bash

ENV=dev
IMAGE_VERSION="3.10.0-SNAPSHOT"

FILE_CONFIG_PATH_LOGBACK=helm/config/${ENV}/logback.xml

clean (){
  #$> clean "helm"
  CHART_PATH=$1
  rm -rf ${CHART_PATH}/charts
  rm -f ${CHART_PATH}/Chart.lock
}

fixVersion () {
  #$> fixAppVersion "helm/Chart.yaml"
  CHART_FILE=$1
  if [[ -f "$CHART_FILE" ]]; then
    yq -i ".appVersion = \"${IMAGE_VERSION}\"" "$CHART_FILE"
  fi
}

########## APP ############
helm uninstall --namespace nodo pagopawebbo
clean "helm"

helm repo add microservice-chart https://pagopa.github.io/aks-microservice-chart-blueprint
helm dep build helm

fixVersion "helm/Chart.yaml"

helm upgrade --install --namespace nodo \
    --values helm/values-${ENV}.yaml \
    --set-file 'microservice-chart.fileConfig.logback\.xml'="${FILE_CONFIG_PATH_LOGBACK}" \
    pagopawebbo helm

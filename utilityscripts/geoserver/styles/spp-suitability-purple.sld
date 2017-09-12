<?xml version="1.0" encoding="UTF-8" ?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>Transparent gradient</Name>
    <UserStyle>
      <Title>SLD Cook Book: Transparent gradient</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>0.7</Opacity>
            <!-- <ColorMap type="intervals"> -->
            <ColorMap>
              <ColorMapEntry color="#ffffff" opacity="0" quantity="-1"/>

              <ColorMapEntry color="#ffcc66" opacity="1" quantity="0.0"/>
              <!-- <ColorMapEntry color="#c899ff" opacity="1" quantity="0.5"/> -->
              <ColorMapEntry color="#cc0099" opacity="1" quantity="0.5"/>
              <ColorMapEntry color="#7700bb" opacity="1" quantity="0.9"/>
              </ColorMap>
            </RasterSymbolizer>
          </Rule>
      </FeatureTypeStyle>
      </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>
